import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Check, X, Plus, Trash2, ArrowLeft } from 'lucide-angular';

import { PedidoService } from '../../service/orders.service';
import { OrderBolsaService } from '../../service/order-bolsa.service';
import { UserService } from '../../../users/service/users-service.service';
import { LoteTostadoService } from '../../../inventory/lotes-tostados/service/lote-tostado.service';
import { InventarioLoteTostadoService } from '../../../inventory/lotes-tostados/service/inventario-lote-tostado.service';
import { AlmacenService } from '../../../inventory/almacenes/service/almacen.service';
import { UiService } from '../../../../shared/services/ui.service';
import { SelectSearchComponent } from '../../../../shared/components/select-search/select-search.component';

import { Pedido } from '../../../../shared/models/pedido';
import { PedidoBolsa } from '../../../../shared/models/pedido-bolsa';
import { User } from '../../../../shared/models/user';
import { Almacen } from '../../../../shared/models/almacen';
import { InventarioLoteTostado } from '../../../../shared/models/inventario-lote-tostado';

const MOLIENDAS = ['ENTERO', 'MOLIENDA_FINA', 'MOLIENDA_MEDIA', 'MOLIENDA_GRUESA', 'NINGUNO'];

interface LineaBolsa extends PedidoBolsa {
  _tempId: string;   // id local para el *ngFor / tracking, no es el id de BD
  _isNew: boolean;
}

@Component({
  selector: 'app-maquila-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, SelectSearchComponent],
  templateUrl: './maquila-form-page.component.html'
})
export class MaquilaFormPage implements OnInit {
  readonly Check = Check;
  readonly X = X;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly ArrowLeft = ArrowLeft;

  readonly molienda = MOLIENDAS;

  mode: 'create' | 'edit' = 'create';
  pedidoId: string | null = null;

  model: Partial<Pedido> = {
    tipo_pedido: 'Maquila',
    id_user: '',
    id_lote_tostado: '',
    id_almacen: '',
    comentario: ''
  };

  lineas: LineaBolsa[] = [];
  lineasEliminadas: string[] = []; // ids de PedidoBolsa a borrar en el backend al guardar (modo edit)

  clientesOriginal: User[] = [];
  clientes: User[] = [];
  lotesTostados: any[] = [];
  almacenes: Almacen[] = [];
  userLote: any = null;

  availableQty: number | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidoSvc: PedidoService,
    private orderBolsaSvc: OrderBolsaService,
    private userSvc: UserService,
    private loteTostadoSvc: LoteTostadoService,
    private inventarioLoteTostadoSvc: InventarioLoteTostadoService,
    private almacenSvc: AlmacenService,
    private uiSvc: UiService
  ) { }

  ngOnInit() {
    this.mode = this.route.snapshot.data['mode'] ?? 'create';
    this.pedidoId = this.route.snapshot.paramMap.get('id');
    this.loadCatalogos();
  }

  loadCatalogos() {
    this.userSvc.getUsers().subscribe(res => {
      this.clientesOriginal = res;
      this.clientes = res;
    });

    this.almacenSvc.getAlmacenesActivos().subscribe(res => {
      this.almacenes = res;
    });

    this.loteTostadoSvc.getAll().subscribe((res: any[]) => {
      this.lotesTostados = res.filter(l => l.peso > 0);

      if (this.mode === 'edit' && this.pedidoId) {
        this.loadPedidoExistente(this.pedidoId);
      } else {
        this.addLinea();
      }
    });
  }

  loadPedidoExistente(id: string) {
    this.pedidoSvc.getPedidoById(id).subscribe(pedido => {
      this.model = { ...pedido };

      if (this.model.id_lote_tostado) {
        const lote = this.lotesTostados.find(l => l.id_lote_tostado === this.model.id_lote_tostado);
        if (lote) {
          this.userSvc.getUserById(lote.id_user).subscribe(u => this.userLote = u);
        }
      }

      if (this.model.id_lote_tostado && this.model.id_almacen) {
        this.refreshDisponible();
      }

      this.orderBolsaSvc.getByPedido(id).subscribe(bolsas => {
        this.lineas = bolsas.map(b => ({
          ...b,
          _tempId: b.id_pedido_bolsa!,
          _isNew: false
        }));
        if (this.lineas.length === 0) this.addLinea();
      });
    });
  }

  // ---------- Lote / almacén ----------

  onLoteChange() {
    const lote = this.lotesTostados.find(l => l.id_lote_tostado === this.model.id_lote_tostado);
    if (!lote) { this.userLote = null; this.availableQty = null; return; }

    this.userSvc.getUserById(lote.id_user).subscribe(u => {
      this.userLote = u;
      if (u.rol === 'admin') {
        this.clientes = [...this.clientesOriginal];
      } else {
        this.clientes = this.clientesOriginal.filter(c => c.id_user === u.id_user);
        this.model.id_user = u.id_user;
      }
    });

    this.refreshDisponible();
  }

  onAlmacenChange() {
    this.refreshDisponible();
  }

  refreshDisponible() {
    if (!this.model.id_lote_tostado || !this.model.id_almacen) {
      this.availableQty = null;
      return;
    }

    this.inventarioLoteTostadoSvc
      .getByLoteTostadoAndAlmacen(this.model.id_lote_tostado, this.model.id_almacen)
      .subscribe({
        next: (inv: InventarioLoteTostado) => this.availableQty = inv.cantidad_kg,
        error: () => this.availableQty = 0
      });
  }

  // ---------- Líneas de embolsado ----------

  addLinea() {
    this.lineas.push({
      _tempId: crypto.randomUUID(),
      _isNew: true,
      gramaje: 250,
      molienda: 'ENTERO',
      cantidad: 1
    });
  }

  removeLinea(linea: LineaBolsa) {
    if (!linea._isNew && linea.id_pedido_bolsa) {
      this.lineasEliminadas.push(linea.id_pedido_bolsa);
    }
    this.lineas = this.lineas.filter(l => l._tempId !== linea._tempId);
  }

  // ---------- Cálculos en vivo ----------

  get totalCantidad(): number {
    return this.lineas.reduce((sum, l) => sum + (Number(l.cantidad) || 0), 0);
  }

  get totalGramos(): number {
    return this.lineas.reduce((sum, l) => sum + (Number(l.gramaje) || 0) * (Number(l.cantidad) || 0), 0);
  }

  get remanente(): number {
    if (this.availableQty == null) return 0;
    return this.availableQty - this.totalGramos;
  }

  get excedeStock(): boolean {
    return this.availableQty != null && this.totalGramos > this.availableQty;
  }

  // ---------- Guardar / cancelar ----------

  onCancel() {
    this.router.navigate(['/orders']);
  }

  onSave() {
    if (!this.model.id_user || !this.model.id_lote_tostado || !this.model.id_almacen) {
      this.uiSvc.alert('warning', 'Campos incompletos', 'Completa cliente, lote tostado y almacén.');
      return;
    }
    if (this.lineas.length === 0 || this.lineas.some(l => !l.gramaje || !l.cantidad)) {
      this.uiSvc.alert('warning', 'Líneas inválidas', 'Agrega al menos una línea válida de embolsado.');
      return;
    }
    if (this.excedeStock) {
      this.uiSvc.alert('error', 'Stock insuficiente',
        `El total a procesar (${this.totalGramos} gr) excede el disponible (${this.availableQty} gr).`);
      return;
    }

    this.loading = true;

    if (this.mode === 'create') {
      this.crearPedido();
    } else {
      this.actualizarPedido();
    }
  }

  private crearPedido() {
    const payload = {
      tipo_pedido: 'Maquila',
      id_user: this.model.id_user,
      id_lote_tostado: this.model.id_lote_tostado,
      id_almacen: this.model.id_almacen,
      comentario: this.model.comentario,
      cantidad: this.totalCantidad,
      bolsas: this.lineas.map(l => ({
        gramaje: Number(l.gramaje),
        molienda: l.molienda,
        cantidad: Number(l.cantidad)
      }))
    };

    console.log('[Maquila] payload enviado:', payload); // 👈 ver qué se manda

    this.pedidoSvc.createPedido(payload).subscribe({
      next: (res) => {
        console.log('[Maquila] respuesta OK:', res); // 👈 confirmar éxito real
        this.uiSvc.alert('success', 'Pedido creado', 'El pedido de maquila se registró correctamente.');
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.loading = false;

        const msg = this.extraerMensajeError(err);
        this.uiSvc.alert('error', 'Error', msg);
      }
    });
  }

  private extraerMensajeError(err: any): string {
    const body = err?.error;

    if (!body) return 'No se pudo crear el pedido de maquila.';

    if (typeof body.error === 'string') return body.error;

    if (Array.isArray(body.error)) {
      return body.error.map((e: any) => e.message || JSON.stringify(e)).join(', ');
    }

    if (typeof body.error === 'object') {
      return JSON.stringify(body.error);
    }

    if (typeof body === 'string') return body;

    return 'No se pudo crear el pedido de maquila.';
  }

  private actualizarPedido() {
    if (!this.pedidoId) return;

    this.pedidoSvc.updatePedido(this.pedidoId, {
      id_user: this.model.id_user,
      id_almacen: this.model.id_almacen,
      comentario: this.model.comentario,
      cantidad: this.totalCantidad
    }).subscribe({
      next: () => this.sincronizarLineas(),
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.error || 'No se pudo actualizar el pedido.';
        this.uiSvc.alert('error', 'Error', msg);
      }
    });
  }

  private sincronizarLineas() {
    const ops: Promise<any>[] = [];

    for (const id of this.lineasEliminadas) {
      ops.push(this.orderBolsaSvc.deleteBolsa(id).toPromise());
    }

    for (const l of this.lineas) {
      const data = { gramaje: Number(l.gramaje), molienda: l.molienda, cantidad: Number(l.cantidad) };
      if (l._isNew) {
        ops.push(this.orderBolsaSvc.addBolsa(this.pedidoId!, data).toPromise());
      } else {
        ops.push(this.orderBolsaSvc.updateBolsa(l.id_pedido_bolsa!, data).toPromise());
      }
    }

    Promise.all(ops).then(() => {
      this.uiSvc.alert('success', 'Pedido actualizado', 'El pedido de maquila se actualizó correctamente.');
      this.router.navigate(['/orders']);
    }).catch(() => {
      this.loading = false;
      this.uiSvc.alert('error', 'Error', 'El pedido se actualizó pero hubo un problema con las líneas.');
    });
  }
}