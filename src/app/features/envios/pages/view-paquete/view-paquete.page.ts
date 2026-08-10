import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Plus, Trash2, Check, Ban, Truck, Eye } from 'lucide-angular';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

import { PaqueteService } from '../../service/paquete.service';
import { AlmacenService } from '../../../inventory/almacenes/service/almacen.service';
import { LoteService } from '../../../inventory/lotes-verdes/service/lote.service';
import { LoteTostadoService } from '../../../inventory/lotes-tostados/service/lote-tostado.service';
import { BolsaService } from '../../../inventory/bolsa/service/bolsa.service';
import { ProductoService } from '../../../inventory/products/service/producto.service';
import { InventarioProductoService } from '../../../inventory/products/service/inventario-producto.service';
import { UiService } from '../../../../shared/services/ui.service';
import { SelectSearchComponent } from '../../../../shared/components/select-search/select-search.component';
import { UserNamePipe } from '../../../../shared/pipes/user-name-pipe.pipe';

import { PaqueteConItems } from '../../../../shared/models/paquete';
import { PaqueteItem, CreatePaqueteItem } from '../../../../shared/models/paquete-item';
import { Almacen } from '../../../../shared/models/almacen';
import { LoteVerdeConInventario } from '../../../../shared/models/lote';
import { LoteTostadoConInventario } from '../../../../shared/models/lote-tostado';
import { BolsaConInventario } from '../../../../shared/models/bolsa';
import { Producto } from '../../../../shared/models/producto';
import { InventarioProducto } from '../../../../shared/models/inventario-producto';
import { EntidadInventario } from '../../../../shared/enum/entidad-inventario.enum';
import { EstadoPaquete } from '../../../../shared/enum/estado-paquete.enum';

interface OpcionEntidad {
  id_entidad: string;
  label: string;
  disponible: number;
  unidad: string;
}

interface TipoEntidad {
  value: EntidadInventario;
  label: string;
}

const ENTIDADES: TipoEntidad[] = [
  { value: EntidadInventario.BOLSA, label: 'Bolsa' },
  { value: EntidadInventario.LOTE, label: 'Lote (verde)' },
  { value: EntidadInventario.LOTE_TOSTADO, label: 'Lote Tostado' },
  { value: EntidadInventario.PRODUCTO, label: 'Producto' },
];

@Component({
  selector: 'app-view-paquete',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, SelectSearchComponent, UserNamePipe],
  templateUrl: './view-paquete.page.html'
})
export class ViewPaquetePage implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly Check = Check;
  readonly Ban = Ban;
  readonly Truck = Truck;
  readonly entidades = ENTIDADES;
  readonly EstadoPaquete = EstadoPaquete;
  readonly Eye = Eye;

  idPaquete = '';
  paquete: PaqueteConItems | null = null;
  loading = false;
  saving = false;
  almacenes: Almacen[] = [];

  // Catálogos por tipo — cacheados con shareReplay(1), igual patrón que OrdenDespachoFormPage
  private lotesVerdes: LoteVerdeConInventario[] = [];
  private lotesTostados: LoteTostadoConInventario[] = [];
  private bolsas: BolsaConInventario[] = [];
  private productos: Producto[] = [];
  private productoInventarios: InventarioProducto[] = [];
  private catalogCache: Partial<Record<EntidadInventario, Observable<any>>> = {};
  private catalogosCargados = new Set<EntidadInventario>();
  cargandoCatalogo: Partial<Record<EntidadInventario, boolean>> = {};

  // Formulario de "agregar artículo"
  nuevoItem = {
    entidad: EntidadInventario.BOLSA,
    id_almacen: '',
    id_entidad: '',
    cantidad: 1,
  };
  opcionesNuevoItem: OpcionEntidad[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private paqueteSvc: PaqueteService,
    private almacenSvc: AlmacenService,
    private loteSvc: LoteService,
    private loteTostadoSvc: LoteTostadoService,
    private bolsaSvc: BolsaService,
    private productoSvc: ProductoService,
    private inventarioProductoSvc: InventarioProductoService,
    private uiSvc: UiService
  ) { }

  ngOnInit(): void {
    this.idPaquete = this.route.snapshot.paramMap.get('id') || '';
    if (!this.idPaquete) return;

    this.almacenSvc.getAlmacenesActivos().subscribe(a => this.almacenes = a);
    this.load();
  }

  load(): void {
    this.loading = true;
    this.paqueteSvc.getById(this.idPaquete).subscribe({
      next: (p) => {
        this.paquete = p;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo cargar el paquete.');
      }
    });
  }

  get enPreparacion(): boolean {
    return this.paquete?.estado === EstadoPaquete.EN_PREPARACION;
  }

  get esListo(): boolean {
    return this.paquete?.estado === EstadoPaquete.LISTO;
  }

  labelEntidad(entidad: string): string {
    return this.entidades.find(e => e.value === entidad)?.label || entidad;
  }

  almacenNombre(idAlmacen: string): string {
    return this.almacenes.find(a => a.id_almacen === idAlmacen)?.nombre || idAlmacen;
  }

  estadoBadgeClass(): string {
    switch (this.paquete?.estado) {
      case EstadoPaquete.EN_PREPARACION: return 'bg-yellow-100 text-yellow-700';
      case EstadoPaquete.LISTO: return 'bg-green-100 text-green-700';
      case EstadoPaquete.DESPACHADO: return 'bg-blue-100 text-blue-700';
      case EstadoPaquete.CANCELADO: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  // ---------- Catálogos por tipo (lazy + cacheados) ----------

  private ensureCatalogo(entidad: EntidadInventario): void {
    if (this.catalogosCargados.has(entidad)) {
      this.buildOpcionesNuevoItem();
      return;
    }

    if (entidad === EntidadInventario.PRODUCTO) {
      this.ensureCatalogoProducto();
      return;
    }

    if (!this.catalogCache[entidad]) {
      this.cargandoCatalogo[entidad] = true;

      let source$: Observable<any[]>;
      switch (entidad) {
        case EntidadInventario.BOLSA:
          source$ = this.bolsaSvc.getConInventario();
          break;
        case EntidadInventario.LOTE:
          source$ = this.loteSvc.getLotesVerdesConInventario();
          break;
        case EntidadInventario.LOTE_TOSTADO:
          source$ = this.loteTostadoSvc.getLotesTostadosConInventario();
          break;
        default:
          source$ = of([]);
      }

      this.catalogCache[entidad] = source$.pipe(
        catchError(err => { console.error(`[ViewPaquete] ❌ "${entidad}" falló:`, err); return of([]); }),
        shareReplay(1)
      );
    }

    this.catalogCache[entidad]!.subscribe((data: any[]) => {
      switch (entidad) {
        case EntidadInventario.BOLSA:
          this.bolsas = (data ?? []).map((b: any) => ({
            ...b,
            inventarios: b.inventarioBolsas ?? b.inventarios ?? []
          }));
          break;
        case EntidadInventario.LOTE:
          this.lotesVerdes = data;
          break;
        case EntidadInventario.LOTE_TOSTADO:
          this.lotesTostados = data;
          break;
      }
      this.catalogosCargados.add(entidad);
      this.cargandoCatalogo[entidad] = false;
      this.buildOpcionesNuevoItem();
    });
  }

  private ensureCatalogoProducto(): void {
    this.cargandoCatalogo[EntidadInventario.PRODUCTO] = true;

    if (!this.catalogCache[EntidadInventario.PRODUCTO]) {
      const productos$ = this.productoSvc.getProductos().pipe(
        catchError(() => of([])), shareReplay(1)
      );
      const inventarios$ = this.inventarioProductoSvc.getInventarios().pipe(
        catchError(() => of([])), shareReplay(1)
      );
      this.catalogCache[EntidadInventario.PRODUCTO] = forkJoin([productos$, inventarios$]).pipe(shareReplay(1));
    }

    (this.catalogCache[EntidadInventario.PRODUCTO] as Observable<[Producto[], InventarioProducto[]]>)
      .subscribe(([productos, inventarios]) => {
        this.productos = productos;
        this.productoInventarios = inventarios;
        this.catalogosCargados.add(EntidadInventario.PRODUCTO);
        this.cargandoCatalogo[EntidadInventario.PRODUCTO] = false;
        this.buildOpcionesNuevoItem();
      });
  }

  // ---------- Formulario "agregar artículo" ----------

  onEntidadNuevoItemChange(): void {
    this.nuevoItem.id_entidad = '';
    this.ensureCatalogo(this.nuevoItem.entidad);
  }

  onAlmacenNuevoItemChange(): void {
    this.nuevoItem.id_entidad = '';
    this.buildOpcionesNuevoItem();
  }

  get cargandoAlgunCatalogo(): boolean {
    return Object.values(this.cargandoCatalogo).some(v => v);
  }

  private buildOpcionesNuevoItem(): void {
    const idCliente = this.paquete?.id_cliente;
    const idAlmacen = this.nuevoItem.id_almacen;
    const entidad = this.nuevoItem.entidad;

    if (!idAlmacen) {
      this.opcionesNuevoItem = [];
      return;
    }

    switch (entidad) {
      case EntidadInventario.BOLSA:
        this.opcionesNuevoItem = this.bolsas
          .filter(b => !b.eliminado && (!idCliente || b.id_user === idCliente))
          .map(b => {
            const inv = b.inventarios?.find(i => i.id_almacen === idAlmacen);
            return {
              id_entidad: b.id_bolsa,
              label: `${b.id_bolsa} · ${b.gramaje}g · ${b.molienda}`,
              disponible: Number(inv?.cantidad || 0),
              unidad: 'unidad',
            };
          })
          .filter(o => o.disponible > 0);
        break;

      case EntidadInventario.LOTE:
        this.opcionesNuevoItem = this.lotesVerdes
          .filter(l => !l.eliminado && (!idCliente || l.id_user === idCliente))
          .map(l => {
            const inv = l.inventarioLotes?.find(i => i.id_almacen === idAlmacen);
            return {
              id_entidad: l.id_lote,
              label: l.finca ? `${l.id_lote} · ${l.finca}` : l.id_lote,
              disponible: Number(inv?.cantidad_kg || 0),
              unidad: 'kg',
            };
          })
          .filter(o => o.disponible > 0);
        break;

      case EntidadInventario.LOTE_TOSTADO:
        this.opcionesNuevoItem = this.lotesTostados
          .filter(l => !l.eliminado && (!idCliente || l.id_user === idCliente))
          .map(l => {
            const inv = l.inventarioLotesTostados?.find((i: any) => i.almacen?.id_almacen === idAlmacen);
            return {
              id_entidad: l.id_lote_tostado,
              label: l.id_lote_tostado,
              disponible: Number(inv?.cantidad_kg || 0),
              unidad: 'gr',
            };
          })
          .filter(o => o.disponible > 0);
        break;

      case EntidadInventario.PRODUCTO:
        this.opcionesNuevoItem = this.productos
          .filter(p => p.activo)
          .map(p => {
            const inv = this.productoInventarios.find(
              i => i.id_producto === p.id_producto && i.almacen?.id_almacen === idAlmacen
            );
            return {
              id_entidad: p.id_producto,
              label: p.nombre,
              disponible: Number(inv?.cantidad || 0),
              unidad: inv?.unidad_medida || 'unidad',
            };
          })
          .filter(o => o.disponible > 0);
        break;
    }
  }

  get opcionSeleccionadaNuevoItem(): OpcionEntidad | undefined {
    return this.opcionesNuevoItem.find(o => o.id_entidad === this.nuevoItem.id_entidad);
  }

  get excedeStockNuevoItem(): boolean {
    const op = this.opcionSeleccionadaNuevoItem;
    if (!op) return false;
    return Number(this.nuevoItem.cantidad || 0) > op.disponible;
  }

  get envioActivo() {
    return (this.paquete?.envios ?? []).find(
      e => e.estado !== 'CANCELADO' && e.estado !== 'DEVUELTO'
    );
  }

  agregarItem(): void {
    if (!this.nuevoItem.id_almacen || !this.nuevoItem.id_entidad || !this.nuevoItem.cantidad) {
      this.uiSvc.alert('warning', 'Campos incompletos', 'Selecciona almacén, artículo y cantidad.');
      return;
    }
    if (this.excedeStockNuevoItem) {
      const op = this.opcionSeleccionadaNuevoItem;
      this.uiSvc.alert('error', 'Stock insuficiente',
        `"${op?.label}" no tiene suficiente stock disponible (${op?.disponible} ${op?.unidad}).`);
      return;
    }

    const payload: CreatePaqueteItem = {
      entidad: this.nuevoItem.entidad,
      id_entidad: this.nuevoItem.id_entidad,
      id_almacen: this.nuevoItem.id_almacen,
      cantidad: Number(this.nuevoItem.cantidad),
    };

    this.saving = true;
    this.paqueteSvc.addItem(this.idPaquete, payload).subscribe({
      next: () => {
        this.saving = false;
        this.nuevoItem = { entidad: EntidadInventario.BOLSA, id_almacen: '', id_entidad: '', cantidad: 1 };
        this.opcionesNuevoItem = [];
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo agregar el artículo.');
      }
    });
  }

  eliminarItem(item: PaqueteItem): void {
    this.uiSvc.confirm({
      title: 'Quitar artículo',
      message: `¿Quitar "${item.id_entidad}" del paquete?`,
      confirmText: 'Quitar',
      cancelText: 'Cancelar'
    }).then(ok => {
      if (!ok) return;

      this.paqueteSvc.removeItem(this.idPaquete, item.id_item).subscribe({
        next: () => this.load(),
        error: (err) => this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo quitar el artículo.')
      });
    });
  }

  // ---------- Acciones de ciclo de vida ----------

  marcarListo(): void {
    if (!this.paquete?.items?.length) {
      this.uiSvc.alert('warning', 'Paquete vacío', 'Agrega al menos un artículo antes de marcar como listo.');
      return;
    }

    this.uiSvc.confirm({
      title: 'Marcar como Listo',
      message: 'El backend revalidará el stock de cada artículo. Una vez listo, ya no podrás editar los artículos.',
      confirmText: 'Marcar Listo',
      cancelText: 'Cancelar'
    }).then(ok => {
      if (!ok) return;

      this.saving = true;
      this.paqueteSvc.marcarListo(this.idPaquete, {}).subscribe({
        next: () => {
          this.saving = false;
          this.uiSvc.alert('success', 'Paquete listo', 'El paquete quedó marcado como listo para enviar.');
          this.load();
        },
        error: (err) => {
          this.saving = false;
          this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo marcar el paquete como listo.');
        }
      });
    });
  }

  cancelarPaquete(): void {
    this.uiSvc.confirm({
      title: 'Cancelar Paquete',
      message: '¿Seguro que deseas cancelar este paquete? Esta acción no se puede revertir.',
      confirmText: 'Cancelar Paquete',
      cancelText: 'Volver'
    }).then(ok => {
      if (!ok) return;

      this.saving = true;
      this.paqueteSvc.cancelar(this.idPaquete, {}).subscribe({
        next: () => {
          this.saving = false;
          this.load();
        },
        error: (err) => {
          this.saving = false;
          this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo cancelar el paquete.');
        }
      });
    });
  }

  crearEnvio(): void {
    this.router.navigate(['/envios/nuevo', this.idPaquete]);
  }

  verOrdenOrigen(): void {
    if (this.paquete?.id_pedido_origen) {
      this.router.navigate(['/orders', this.paquete.id_pedido_origen]);
    }
  }

  goBack(): void {
    this.router.navigate(['/envios']);
  }
}