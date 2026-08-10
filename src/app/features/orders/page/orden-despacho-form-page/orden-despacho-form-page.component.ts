import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Check, Plus, Trash2 } from 'lucide-angular';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

import { PedidoService } from '../../service/orders.service';
import { PedidoItemService } from '../../service/pedido-item.service';
import { UserService } from '../../../users/service/users-service.service';
import { AlmacenService } from '../../../inventory/almacenes/service/almacen.service';
import { LoteService } from '../../../inventory/lotes-verdes/service/lote.service';
import { LoteTostadoService } from '../../../inventory/lotes-tostados/service/lote-tostado.service';
import { BolsaService } from '../../../inventory/bolsa/service/bolsa.service';
import { ProductoService } from '../../../inventory/products/service/producto.service';
import { InventarioProductoService } from '../../../inventory/products/service/inventario-producto.service';
import { UiService } from '../../../../shared/services/ui.service';
import { SelectSearchComponent } from '../../../../shared/components/select-search/select-search.component';

import { Pedido } from '../../../../shared/models/pedido';
import { User } from '../../../../shared/models/user';
import { Almacen } from '../../../../shared/models/almacen';
import { LoteVerdeConInventario } from '../../../../shared/models/lote';
import { LoteTostadoConInventario } from '../../../../shared/models/lote-tostado';
import { BolsaConInventario } from '../../../../shared/models/bolsa';
import { Producto } from '../../../../shared/models/producto';
import { InventarioProducto } from '../../../../shared/models/inventario-producto';
import { EntidadInventario } from '../../../../shared/enum/entidad-inventario.enum';

interface LineaItem {
  _tempId: string;
  entidad: EntidadInventario;
  id_entidad: string;
  cantidad: number;
}

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
  selector: 'app-orden-despacho-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, SelectSearchComponent],
  templateUrl: './orden-despacho-form-page.component.html'
})
export class OrdenDespachoFormPage implements OnInit {
  readonly Check = Check;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly entidades = ENTIDADES;

  mode: 'create' | 'edit' = 'create';
  pedidoId: string | null = null;

  model: Partial<Pedido> = {
    tipo_pedido: 'OrdenDespacho',
    id_user: '',
    id_almacen: '',
    comentario: ''
  };

  lineas: LineaItem[] = [];

  clientes: User[] = [];
  almacenes: Almacen[] = [];

  private lotesVerdes: LoteVerdeConInventario[] = [];
  private lotesTostados: LoteTostadoConInventario[] = [];
  private bolsas: BolsaConInventario[] = [];
  private productos: Producto[] = [];
  private productoInventarios: InventarioProducto[] = [];

  // Cache por tipo de entidad — una vez pedido un catálogo, no se vuelve a pedir
  // aunque el cliente o el almacén cambien (el filtro es siempre client-side).
  private catalogCache: Partial<Record<EntidadInventario, Observable<any>>> = {};
  private catalogosCargados = new Set<EntidadInventario>();

  // Evita reevaluar / re-autoseleccionar el almacén más de una vez por cliente elegido.
  private clienteEvaluado: string | null = null;
  // Evita repetir el mismo toast de "sin artículos" en cada rebuild de opciones.
  private lastEmptyAlertKey: string | null = null;

  opcionesPorTipo: Record<EntidadInventario, OpcionEntidad[]> = {
    [EntidadInventario.BOLSA]: [],
    [EntidadInventario.LOTE]: [],
    [EntidadInventario.LOTE_TOSTADO]: [],
    [EntidadInventario.PRODUCTO]: [],
    [EntidadInventario.MUESTRA]: [],
    [EntidadInventario.INSUMO]: [],
  };

  cargandoCatalogo: Partial<Record<EntidadInventario, boolean>> = {};
  catalogosListos = false;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidoSvc: PedidoService,
    private pedidoItemSvc: PedidoItemService,
    private userSvc: UserService,
    private almacenSvc: AlmacenService,
    private loteSvc: LoteService,
    private loteTostadoSvc: LoteTostadoService,
    private bolsaSvc: BolsaService,
    private productoSvc: ProductoService,
    private inventarioProductoSvc: InventarioProductoService,
    private uiSvc: UiService
  ) { }

  ngOnInit() {
    this.mode = this.route.snapshot.data['mode'] ?? 'create';
    this.pedidoId = this.route.snapshot.paramMap.get('id');
    this.loadBase();
  }

  private loadBase() {
    forkJoin({
      clientes: this.userSvc.getUsers().pipe(catchError(() => of([]))),
      almacenes: this.almacenSvc.getAlmacenesActivos().pipe(catchError(() => of([]))),
    }).subscribe(({ clientes, almacenes }) => {
      this.clientes = clientes;
      this.almacenes = almacenes;
      this.catalogosListos = true;

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
      // En edición no queremos que se pise el almacén ya guardado con la auto-selección.
      this.clienteEvaluado = this.model.id_user || null;
      if (this.model.id_user) this.ensureAllCatalogos();
    });

    this.pedidoItemSvc.getByPedido(id).subscribe(items => {
      this.lineas = items.map(i => ({
        _tempId: i.id_pedido_item,
        entidad: i.entidad,
        id_entidad: i.id_entidad,
        cantidad: i.cantidad
      }));
      if (this.lineas.length === 0) this.addLinea();
    });
  }

  // ---------- Carga por tipo de entidad (cacheada con shareReplay) ----------

  private ensureAllCatalogos() {
    [EntidadInventario.BOLSA, EntidadInventario.LOTE, EntidadInventario.LOTE_TOSTADO, EntidadInventario.PRODUCTO]
      .forEach(t => this.ensureCatalogo(t));
  }

  private ensureCatalogo(entidad: EntidadInventario) {
    if (this.catalogosCargados.has(entidad)) {
      this.onCatalogoListo();
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
        catchError(err => { console.error(`[OrdenDespacho] ❌ "${entidad}" falló:`, err); return of([]); }),
        shareReplay(1)
      );
    }

    this.catalogCache[entidad]!.subscribe((data: any[]) => {
      switch (entidad) {
        case EntidadInventario.BOLSA:
          // El backend serializa esta relación como "inventarioBolsas", no "inventarios"
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
      this.onCatalogoListo();
    });
  }

  private ensureCatalogoProducto() {
    this.cargandoCatalogo[EntidadInventario.PRODUCTO] = true;

    if (!this.catalogCache[EntidadInventario.PRODUCTO]) {
      const productos$ = this.productoSvc.getProductos().pipe(
        catchError(err => { console.error('[OrdenDespacho] ❌ productos falló:', err); return of([]); }),
        shareReplay(1)
      );
      const inventarios$ = this.inventarioProductoSvc.getInventarios().pipe(
        catchError(err => { console.error('[OrdenDespacho] ❌ inventario-producto falló:', err); return of([]); }),
        shareReplay(1)
      );
      this.catalogCache[EntidadInventario.PRODUCTO] = forkJoin([productos$, inventarios$]).pipe(shareReplay(1));
    }

    (this.catalogCache[EntidadInventario.PRODUCTO] as Observable<[Producto[], InventarioProducto[]]>)
      .subscribe(([productos, inventarios]) => {
        this.productos = productos;
        this.productoInventarios = inventarios;

        this.catalogosCargados.add(EntidadInventario.PRODUCTO);
        this.cargandoCatalogo[EntidadInventario.PRODUCTO] = false;
        this.onCatalogoListo();
      });
  }

  /** Se llama cada vez que un catálogo termina de cargar (o ya estaba en caché).
   *  Recalcula opciones y, si ya no falta ninguno, evalúa el almacén del cliente. */
  private onCatalogoListo() {
    this.buildOpciones();
    this.evaluarAlmacenesParaCliente();
  }

  // ---------- Cliente / Almacén ----------

  onClienteChange(idCliente: string) {
    this.model.id_user = idCliente;
    this.model.id_almacen = '';
    this.clienteEvaluado = null;
    this.lastEmptyAlertKey = null;
    this.lineas.forEach(l => { l.id_entidad = ''; });

    this.buildOpciones();
    this.ensureAllCatalogos(); // si ya estaba cacheado, dispara onCatalogoListo() al toque
  }

  onAlmacenChange() {
    this.buildOpciones();
  }

  onEntidadChange(linea: LineaItem) {
    linea.id_entidad = '';
  }

  /** ¿Este cliente tiene algo (de cualquier tipo) en este almacén puntual? */
  private tieneStockClienteEnAlmacen(idAlmacen: string): boolean {
    const idCliente = this.model.id_user;

    const bolsaOk = this.bolsas.some(b =>
      !b.eliminado && (!idCliente || b.id_user === idCliente) &&
      (b.inventarios || []).some(i => i.id_almacen === idAlmacen && Number(i.cantidad) > 0));

    const loteOk = this.lotesVerdes.some(l =>
      !l.eliminado && (!idCliente || l.id_user === idCliente) &&
      (l.inventarioLotes || []).some(i => i.id_almacen === idAlmacen && Number(i.cantidad_kg) > 0));

    const loteTostadoOk = this.lotesTostados.some(l =>
      !l.eliminado && (!idCliente || l.id_user === idCliente) &&
      (l.inventarioLotesTostados || []).some((i: any) => i.almacen?.id_almacen === idAlmacen && Number(i.cantidad_kg) > 0));

    // Producto es de la tienda, no del cliente — cuenta para cualquier cliente.
    const productoOk = this.productos.some(p => p.activo &&
      this.productoInventarios.some(i =>
        i.id_producto === p.id_producto && i.almacen?.id_almacen === idAlmacen && Number(i.cantidad) > 0));

    return bolsaOk || loteOk || loteTostadoOk || productoOk;
  }

  /** Almacenes donde el cliente elegido realmente tiene algo. Vacío mientras
   *  no haya cliente o mientras los catálogos siguen cargando. */
  get almacenesDisponibles(): Almacen[] {
    if (!this.model.id_user || this.cargandoAlgunCatalogo) return [];
    return this.almacenes.filter(a => this.tieneStockClienteEnAlmacen(a.id_almacen));
  }

  /** Autoselecciona el almacén si hay exactamente uno con stock, limpia si hay cero,
   *  y no hace nada si hay varios (ahí sí elige la persona). Se ejecuta una sola vez
   *  por cliente, recién cuando terminaron de cargar los 4 catálogos. */
  private evaluarAlmacenesParaCliente() {
    if (this.cargandoAlgunCatalogo) return;

    const idCliente = this.model.id_user || '';
    if (this.clienteEvaluado === idCliente) return;
    this.clienteEvaluado = idCliente;

    const disponibles = this.almacenesDisponibles;

    if (disponibles.length === 0) {
      this.model.id_almacen = '';
      if (idCliente) {
        this.uiSvc.alert('warning', 'Sin stock', 'Este cliente no tiene stock disponible en ningún almacén.');
      }
    } else if (disponibles.length === 1) {
      this.model.id_almacen = disponibles[0].id_almacen;
    }

    this.buildOpciones();
  }

  private buildOpciones() {
    const idCliente = this.model.id_user;
    const idAlmacen = this.model.id_almacen;

    if (!idAlmacen) {
      this.opcionesPorTipo = {
        [EntidadInventario.BOLSA]: [],
        [EntidadInventario.LOTE]: [],
        [EntidadInventario.LOTE_TOSTADO]: [],
        [EntidadInventario.PRODUCTO]: [],
        [EntidadInventario.MUESTRA]: [],
        [EntidadInventario.INSUMO]: [],
      };
      this.lastEmptyAlertKey = null;
      return;
    }

    this.opcionesPorTipo[EntidadInventario.BOLSA] = this.bolsas
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

    this.opcionesPorTipo[EntidadInventario.LOTE] = this.lotesVerdes
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

    this.opcionesPorTipo[EntidadInventario.LOTE_TOSTADO] = this.lotesTostados
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

    this.opcionesPorTipo[EntidadInventario.PRODUCTO] = this.productos
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

    this.autocorregirLineas();
    this.checkSinArticulos(idCliente, idAlmacen);
  }

  /** Si una línea quedó con un tipo sin stock real Y todavía no eligió artículo,
   *  se cambia sola al primer tipo que sí tiene stock — evita el parpadeo de
   *  "aparece un tipo, después desaparece" cuando recién llegan los datos reales. */
  private autocorregirLineas() {
    if (this.cargandoAlgunCatalogo) return;

    const disponibles = this.tiposDisponibles;
    if (!disponibles.length) return;

    this.lineas.forEach(l => {
      const sinStockReal = (this.opcionesPorTipo[l.entidad] || []).length === 0;
      if (sinStockReal && !l.id_entidad) {
        l.entidad = disponibles[0].value;
      }
    });
  }

  // ---------- Tipos disponibles ----------

  get cargandoAlgunCatalogo(): boolean {
    return Object.values(this.cargandoCatalogo).some(v => v);
  }

  get tiposDisponibles(): TipoEntidad[] {
    if (!this.model.id_almacen) return [];
    return this.entidades.filter(e => (this.opcionesPorTipo[e.value] || []).length > 0);
  }

  tiposParaLinea(linea: LineaItem): TipoEntidad[] {
    const disponibles = this.tiposDisponibles;
    if (disponibles.some(e => e.value === linea.entidad)) return disponibles;
    const actual = this.entidades.find(e => e.value === linea.entidad);
    return actual ? [actual, ...disponibles] : disponibles;
  }

  opcionesLinea(linea: LineaItem): OpcionEntidad[] {
    return this.opcionesPorTipo[linea.entidad] || [];
  }

  opcionSeleccionada(linea: LineaItem): OpcionEntidad | undefined {
    return this.opcionesLinea(linea).find(o => o.id_entidad === linea.id_entidad);
  }

  excedeStockLinea(linea: LineaItem): boolean {
    const op = this.opcionSeleccionada(linea);
    if (!op) return false;
    return Number(linea.cantidad || 0) > op.disponible;
  }

  private checkSinArticulos(idCliente?: string, idAlmacen?: string) {
    if (this.cargandoAlgunCatalogo) return;

    const key = `${idCliente || ''}|${idAlmacen || ''}`;

    if (this.tiposDisponibles.length === 0) {
      if (this.lastEmptyAlertKey !== key) {
        this.lastEmptyAlertKey = key;
        this.uiSvc.alert(
          'warning',
          'Sin artículos disponibles',
          'Este cliente no tiene artículos disponibles en el almacén seleccionado.'
        );
      }
    } else {
      this.lastEmptyAlertKey = null;
    }
  }

  // ---------- Líneas ----------

  addLinea() {
    const disponibles = this.tiposDisponibles;
    const entidadDefault = disponibles.length ? disponibles[0].value : EntidadInventario.BOLSA;
    this.lineas.push({
      _tempId: crypto.randomUUID(),
      entidad: entidadDefault,
      id_entidad: '',
      cantidad: 1
    });
  }

  removeLinea(linea: LineaItem) {
    this.lineas = this.lineas.filter(l => l._tempId !== linea._tempId);
  }

  // ---------- Cálculos en vivo ----------

  get totalCantidad(): number {
    return this.lineas.reduce((sum, l) => sum + (Number(l.cantidad) || 0), 0);
  }

  get totalLineas(): number {
    return this.lineas.length;
  }

  labelTipo(entidad: EntidadInventario): string {
    return this.entidades.find(e => e.value === entidad)?.label || entidad;
  }

  // ---------- Guardar / cancelar ----------

  onCancel() {
    this.router.navigate(['/orders']);
  }

  onSave() {
    if (!this.model.id_user || !this.model.id_almacen) {
      this.uiSvc.alert('warning', 'Campos incompletos', 'Completa cliente y almacén.');
      return;
    }
    if (this.lineas.length === 0 || this.lineas.some(l => !l.id_entidad || !l.cantidad)) {
      this.uiSvc.alert('warning', 'Líneas inválidas', 'Agrega al menos un artículo válido para preparar.');
      return;
    }
    const lineaExcedida = this.lineas.find(l => this.excedeStockLinea(l));
    if (lineaExcedida) {
      const op = this.opcionSeleccionada(lineaExcedida);
      this.uiSvc.alert('error', 'Stock insuficiente',
        `"${op?.label}" no tiene suficiente stock disponible (${op?.disponible} ${op?.unidad}).`);
      return;
    }

    this.loading = true;

    const items = this.lineas.map(l => ({
      entidad: l.entidad,
      id_entidad: l.id_entidad,
      cantidad: Number(l.cantidad)
    }));

    if (this.mode === 'create') {
      this.crearPedido(items);
    } else {
      this.actualizarPedido(items);
    }
  }

  private crearPedido(items: any[]) {
    const payload = {
      tipo_pedido: 'OrdenDespacho',
      id_user: this.model.id_user,
      id_almacen: this.model.id_almacen,
      comentario: this.model.comentario,
      cantidad: this.totalCantidad,
      items
    };

    this.pedidoSvc.createPedido(payload).subscribe({
      next: () => {
        this.uiSvc.alert('success', 'Orden creada', 'La Orden de Despacho se registró correctamente.');
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.loading = false;
        this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo crear la Orden de Despacho.');
      }
    });
  }

  private actualizarPedido(items: any[]) {
    if (!this.pedidoId) return;

    const payload = {
      id_user: this.model.id_user,
      id_almacen: this.model.id_almacen,
      comentario: this.model.comentario,
      cantidad: this.totalCantidad,
      items
    };

    this.pedidoSvc.updatePedido(this.pedidoId, payload).subscribe({
      next: () => {
        this.uiSvc.alert('success', 'Orden actualizada', 'La Orden de Despacho se actualizó correctamente.');
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.loading = false;
        this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo actualizar la Orden de Despacho.');
      }
    });
  }
}