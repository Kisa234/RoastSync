import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Check, Plus, Trash2 } from 'lucide-angular';

import { PedidoService } from '../../../orders/service/orders.service';
import { LoteService } from '../../../inventory/lotes-verdes/service/lote.service';
import { UserService } from '../../../users/service/users-service.service';
import { RoastsService } from '../../service/roasts.service';
import { UiService } from '../../../../shared/services/ui.service';

import { Pedido } from '../../../../shared/models/pedido';
import { User } from '../../../../shared/models/user';

interface Batch {
  id: number;
  pesoVerde: number;
  pesoTostado: number;
}

interface AlmacenConStock {
  id_almacen: string;
  nombre: string;
  pesoVerde: number;
  pesoTostado: number;
}

@Component({
  selector: 'app-order-tueste-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './order-tueste-form-page.component.html'
})
export class OrderTuesteFormPage implements OnInit {
  readonly Check = Check;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;

  // sentinel de UI — no es un id_user real, solo marca "lotes de la tienda"
  readonly STORE_SENTINEL = '__STORE__';

  mode: 'create' | 'edit' = 'create';
  pedidoId: string | null = null;

  clientes: User[] = [];
  clientesConTienda: (User | { id_user: string; nombre: string })[] = [];
  lotes: any[] = [];
  private lotesAll: any[] = [];

  /** Stock del lote elegido, desglosado por almacén — reemplaza al bug de sumar todo junto. */
  almacenesConStock: AlmacenConStock[] = [];

  readonly Tostadoras: string[] = ['Kaleido', 'Candela'];
  readonly tiposTueste: string[] = ['Tueste Claro', 'Tueste Medio', 'Tueste Oscuro'];

  orden: Partial<Pedido> = {
    tipo_pedido: 'Orden Tueste',
    cantidad: 0,
    comentario: '',
    id_user: '',
    id_lote: '',
    id_almacen: '',
    tostadora: '',
    facturado: undefined,
    fecha_tueste: new Date(),
  };

  // selección real del selector "Cliente" — puede ser el sentinel de tienda
  clienteSeleccionado = '';

  batches: Batch[] = [];
  batchTostado = 0;

  loading = false;
  saving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidoSvc: PedidoService,
    private loteSvc: LoteService,
    private userSvc: UserService,
    private roastsSvc: RoastsService,
    private uiSvc: UiService,
  ) { }

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'] ?? 'create';
    this.pedidoId = this.route.snapshot.paramMap.get('id');
    this.loadCatalogos();
  }

  private loadCatalogos(): void {
    this.loading = true;
    this.userSvc.getUsers().subscribe(usuarios => {
      this.loteSvc.getAll().subscribe(lotes => {
        this.lotesAll = lotes;
        this.clientes = usuarios.filter(u => lotes.some((l: any) => l.id_user === u.id_user));

        // "FORTUNATO" solo aparece como opción si realmente hay lotes de tienda que tostar
        const hayLotesDeTienda = lotes.some((l: any) => l.owned_by_store);
        this.clientesConTienda = hayLotesDeTienda
          ? [{ id_user: this.STORE_SENTINEL, nombre: 'FORTUNATO (Tienda)' }, ...this.clientes]
          : this.clientes;

        this.loading = false;

        if (this.mode === 'edit' && this.pedidoId) {
          this.loadPedidoExistente(this.pedidoId);
        } else {
          this.agregarBatch();
        }
      });
    });
  }

  private loadPedidoExistente(id: string): void {
    this.pedidoSvc.getPedidoById(id).subscribe(pedido => {
      this.orden = { ...pedido };

      // Reconstruye la selección visual del selector a partir del lote real del pedido,
      // no del id_user guardado — si el lote origen es de tienda, el select debe
      // mostrar "FORTUNATO" aunque el pedido internamente tenga el id_user sentinel.
      const loteDelPedido = this.lotesAll.find((l: any) => l.id_lote === this.orden.id_lote);
      if (loteDelPedido?.owned_by_store) {
        this.clienteSeleccionado = this.STORE_SENTINEL;
        this.lotes = this.lotesAll.filter((l: any) => l.owned_by_store);
      } else {
        this.clienteSeleccionado = this.orden.id_user ?? '';
        this.lotes = this.lotesAll.filter((l: any) => l.id_user === this.orden.id_user);
      }

      this.recalcularAlmacenesConStock();

      this.batchTostado = parseFloat(((this.orden.cantidad ?? 0) * 0.85).toFixed(2));

      // Reconstruye desde los Tueste reales ya creados — no desde pedido.pesos,
      // que solo tenía los verdes originales, sin el detalle real por batch.
      this.roastsSvc.getTuestesByPedido(id).subscribe(tuestes => {
        this.batches = tuestes.length
          ? tuestes.map((t: any, i: number) => ({
              id: i + 1,
              pesoVerde: t.peso_entrada,
              pesoTostado: parseFloat((t.peso_entrada * 0.85).toFixed(2)),
            }))
          : [{ id: 1, pesoVerde: 0, pesoTostado: 0 }];
      });
    });
  }

  onClienteChange(): void {
    if (this.clienteSeleccionado === this.STORE_SENTINEL) {
      this.lotes = this.lotesAll.filter((l: any) => l.owned_by_store);
      this.orden.id_user = undefined;
    } else if (this.clienteSeleccionado) {
      this.lotes = this.lotesAll.filter((l: any) => l.id_user === this.clienteSeleccionado);
      this.orden.id_user = this.clienteSeleccionado;
    } else {
      this.lotes = [];
      this.orden.id_user = undefined;
    }
    this.orden.id_lote = '';
    this.orden.id_almacen = '';
    this.almacenesConStock = [];
  }

  /** Corrige el bug real: antes sumaba TODOS los almacenes del lote sin distinguir.
   *  Ahora desglosa por almacén, y el campo "disponible" solo refleja el almacén
   *  elegido en el select de abajo. */
  onLoteChange(): void {
    this.orden.id_almacen = '';
    this.recalcularAlmacenesConStock();
  }

  private recalcularAlmacenesConStock(): void {
    this.almacenesConStock = [];

    if (!this.orden.id_lote) return;

    // getAll() (usado para el <select> de Lote) no trae inventarioLotes —
    // hay que pedir el detalle aparte, mismo patrón que ViewOrderPage.
    this.loteSvc.getLoteVerdeConInventarioById(this.orden.id_lote).subscribe({
      next: (loteConInventario) => {
        this.almacenesConStock = (loteConInventario.inventarioLotes ?? [])
          .filter(inv => Number(inv.cantidad_kg) > 0)
          .map(inv => ({
            id_almacen: inv.id_almacen,
            nombre: inv.almacen?.nombre || 'Almacén',
            pesoVerde: Number(inv.cantidad_kg) || 0,
            pesoTostado: Number(inv.cantidad_tostado_kg) || 0,
          }));

        // Autoselección solo en modo create, y solo después de tener el
        // detalle real — antes esto corría antes de que llegara la data.
        if (this.mode === 'create' && this.almacenesConStock.length === 1) {
          this.orden.id_almacen = this.almacenesConStock[0].id_almacen;
        }
      },
      error: (err) => console.error('Error al cargar inventario del lote:', err)
    });
  }

  onAlmacenChange(): void {
    // El disponible ya se lee directo de almacenSeleccionado (getter) — no hay
    // estado adicional que sincronizar acá, queda para claridad del flujo.
  }

  get almacenSeleccionado(): AlmacenConStock | undefined {
    return this.almacenesConStock.find(a => a.id_almacen === this.orden.id_almacen);
  }

  get pesoVerdeDisp(): number {
    return this.almacenSeleccionado?.pesoVerde ?? 0;
  }

  get pesoTostadoDisp(): number {
    return this.almacenSeleccionado?.pesoTostado ?? 0;
  }

  // ---------- Batches ----------

  agregarBatch(): void {
    const nextId = this.batches.length + 1;
    this.batches.push({ id: nextId, pesoVerde: 0, pesoTostado: 0 });
  }

  quitarBatch(b: Batch): void {
    this.batches = this.batches.filter(x => x.id !== b.id);
  }

  onBatchVerdeChange(b: Batch): void {
    b.pesoTostado = parseFloat((b.pesoVerde * 0.85).toFixed(2));
  }

  onBatchTostadoChange(b: Batch): void {
    b.pesoVerde = parseFloat((b.pesoTostado * 1.15).toFixed(2));
  }

  onBatchVerdeGlobalChange(): void {
    this.batchTostado = parseFloat(((this.orden.cantidad ?? 0) * 0.85).toFixed(2));
  }

  onBatchTostadoGlobalChange(): void {
    this.orden.cantidad = parseFloat((this.batchTostado * 1.15).toFixed(2));
  }

  get totalVerde(): number {
    return this.batches.reduce((sum, b) => sum + b.pesoVerde, 0);
  }

  get totalTostado(): number {
    return this.batches.reduce((sum, b) => sum + b.pesoTostado, 0);
  }

  // ---------- Validación ----------

  private validarFormulario(): boolean {
    if (!this.clienteSeleccionado) {
      this.uiSvc.alert('warning', 'Campo requerido', 'Debes seleccionar un cliente.');
      return false;
    }
    if (!this.orden.id_lote) {
      this.uiSvc.alert('warning', 'Campo requerido', 'Debes seleccionar un lote.');
      return false;
    }
    if (!this.orden.id_almacen) {
      this.uiSvc.alert('warning', 'Campo requerido', 'Debes seleccionar un almacén con stock.');
      return false;
    }
    if (!this.orden.fecha_tueste) {
      this.uiSvc.alert('warning', 'Campo requerido', 'Debes seleccionar la fecha de tueste.');
      return false;
    }
    if (!this.orden.comentario?.toString().trim()) {
      this.uiSvc.alert('warning', 'Campo requerido', 'Debes seleccionar el tipo de tueste.');
      return false;
    }
    if (!this.orden.tostadora?.toString().trim()) {
      this.uiSvc.alert('warning', 'Campo requerido', 'Debes seleccionar la tostadora.');
      return false;
    }
    if (this.orden.facturado === undefined || this.orden.facturado === null) {
      this.uiSvc.alert('warning', 'Campo requerido', 'Debes indicar si es facturado o no.');
      return false;
    }
    if (!this.orden.cantidad || this.orden.cantidad <= 0) {
      this.uiSvc.alert('warning', 'Campo requerido', 'Debes ingresar una cantidad válida para el batch verde.');
      return false;
    }
    if (!this.batchTostado || this.batchTostado <= 0) {
      this.uiSvc.alert('warning', 'Campo requerido', 'Debes ingresar una cantidad válida para el batch tostado.');
      return false;
    }
    if (!this.batches.length) {
      this.uiSvc.alert('warning', 'Campo requerido', 'Debes agregar al menos un batch.');
      return false;
    }
    const batchInvalido = this.batches.some(
      b => !b.pesoVerde || b.pesoVerde <= 0 || !b.pesoTostado || b.pesoTostado <= 0
    );
    if (batchInvalido) {
      this.uiSvc.alert('warning', 'Batches incompletos', 'Todos los batches deben tener pesos válidos.');
      return false;
    }
    if (this.mode === 'create' && this.totalVerde > this.pesoVerdeDisp) {
      this.uiSvc.alert('warning', 'Stock insuficiente',
        `El peso verde total de los batches (${this.totalVerde}gr) supera el disponible en este almacén (${this.pesoVerdeDisp}gr).`);
      return false;
    }
    if (this.totalVerde !== this.orden.cantidad) {
      this.uiSvc.alert('warning', 'Inconsistencia',
        'El peso verde total de los batches debe ser igual a la cantidad de la orden.');
      return false;
    }
    return true;
  }

  // ---------- Guardar / cancelar ----------

  onCancel(): void {
    this.router.navigate(['/roasts']);
  }

  onSave(): void {
    if (!this.validarFormulario()) return;

    this.saving = true;
    const payload = {
      ...this.orden,
      pesos: this.batches.map(b => b.pesoVerde),
    };

    const request = this.mode === 'create'
      ? this.pedidoSvc.createPedido(payload)
      : this.pedidoSvc.updatePedido(this.pedidoId!, payload);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.uiSvc.alert('success',
          this.mode === 'create' ? 'Orden creada' : 'Orden actualizada',
          `La orden de tueste se ${this.mode === 'create' ? 'registró' : 'actualizó'} correctamente.`);
        this.router.navigate(['/roasts']);
      },
      error: (err) => {
        this.saving = false;
        this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo guardar la orden de tueste.');
      }
    });
  }
}