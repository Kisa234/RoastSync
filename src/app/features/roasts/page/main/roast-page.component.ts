import { User } from './../../../../shared/models/user';
import { Component } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Sheet, Flame } from 'lucide-angular';
import { X, Check, Eye, Edit, Trash, ReceiptText } from 'lucide-angular';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


import { AddRoasterComponent } from '../../components/add-order-roast/add-order-roast.component';
import { Pedido, PedidoConLote } from '../../../../shared/models/pedido';
import { PedidoService } from '../../../orders/service/orders.service';
import { UserService } from '../../../users/service/users-service.service';
import { UiService } from '../../../../shared/services/ui.service';
import { RoastsService } from '../../service/roasts.service';
import { Tueste } from '../../../../shared/models/tueste';
import { UserNamePipe } from "../../../../shared/pipes/user-name-pipe.pipe";
import { MinSecPipe } from "../../../../shared/pipes/time.pipe";
import { LoteService } from '../../../inventory/lotes-verdes/service/lote.service';
import { FichaTuesteComponent } from '../../../inventory/lotes-tostados/components/ficha-tueste/ficha-tueste.component';
import { Router } from '@angular/router';




@Component({
  selector: 'roasts-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    LucideAngularModule,
    AddRoasterComponent,
    FichaTuesteComponent,
    UserNamePipe,
    MinSecPipe,
  ],
  templateUrl: './roast-page.component.html',
})
export class RoastsPage {
  readonly Plus = Plus;
  readonly Flame = Flame;
  readonly X = X;
  readonly Check = Check;
  readonly Eye = Eye;
  readonly Edit = Edit;
  readonly Trash = Trash;
  readonly Sheet = Sheet;
  readonly ReceiptText = ReceiptText;

  pendingOrders: PedidoConLote[] = [];
  allHistoryRoasts: PedidoConLote[] = [];
  filteredHistoryRoasts: PedidoConLote[] = [];
  allRoasts: Tueste[] = [];
  filteredAllRoasts: Tueste[] = [];


  startDate = '';
  endDate = '';
  showAddRoaster = false;
  historyDate = '';
  historyLevel = '';
  roastLevels = ['Claro', 'Medio', 'Oscuro'];
  showRoastsModal = false;
  showEditRoastModal = false;
  showAllRoasts = false;
  selectedOrder?: Pedido;
  selectedTuesteId = '';
  showFichaTueste = false;
  showAddBalonGas = false;

  // paginator (historial)
  page = 1;
  pageSize = 5;
  totalPages = 1;
  pagedHistoryRoasts: PedidoConLote[] = [];

  activeTab: 'historial' | 'sin_facturar' = 'historial';
  sinFacturarRoasts: PedidoConLote[] = [];
  pagedSinFacturar: PedidoConLote[] = [];
  pageSF = 1;
  totalPagesSF = 1;

  // filter client 

  clients: User[] = [];
  selectedClientId = '';

  // ── Tab principal: 'pendientes' | 'historico' ──
  pendingTab: 'pendientes' | 'historico' = 'pendientes';

  // ── Sub-tab dentro de Pendientes: 'todos' | 'yyyy-MM-dd' (día) ──
  pendingSubTab: string = 'todos';
  pagePendientes = 1;
  pageSizePendientes = 5;


  constructor(
    private loteSvc: LoteService,
    private pedidoSvc: PedidoService,
    private roastsSvc: RoastsService,
    private userSvc: UserService,
    private uiSvc: UiService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.loadPending();
    this.loadClients(() => this.loadHistory());
    this.loadAllRoasts();
  }

  loadClients(callback?: () => void) {
    this.userSvc.getUsers().subscribe(list => {
      this.clients = list;
      callback?.();
    });
  }


  private loadPending() {
    this.pedidoSvc
      .getPedidosConLoteByEstadoYTipo('Pendiente', 'Orden Tueste')
      .subscribe({
        next: (list) => {
          this.pendingOrders = list ?? [];
          this.pagePendientes = 1;
        },
        error: (error) => {
          console.error('Error cargando órdenes de tueste pendientes con lote:', error);
          this.pendingOrders = [];
        }
      });
  }

  loadHistory() {
    this.pedidoSvc
      .getPedidosConLoteByEstadoYTipo('Completado', 'Orden Tueste')
      .subscribe({
        next: (list) => {
          this.allHistoryRoasts = list ?? [];
          this.applyFilter();
          console.log('Órdenes de tueste completadas con lote cargadas:', this.allHistoryRoasts);
        },
        error: (error) => {
          console.error('Error cargando historial de tuestes:', error);
          this.allHistoryRoasts = [];
          this.filteredHistoryRoasts = [];
          this.pagedHistoryRoasts = [];
        }
      });
  }
  loadAllRoasts() {
    this.roastsSvc.getAllTuestes().subscribe(list => {
      this.allRoasts = list;
      this.filteredAllRoasts = list;
    });
  }

  getEstadoFacturacion(p: PedidoConLote): 'ES_NUESTRO' | 'FACTURADO' | 'NO_FACTURADO' {
    if (p.owned_by_store) return 'ES_NUESTRO';
    if (p.facturado === true) return 'FACTURADO';
    return 'NO_FACTURADO';
  }

  facturarPedido(o: PedidoConLote) {
    const estado = this.getEstadoFacturacion(o);

    if (estado === 'ES_NUESTRO') {
      this.uiSvc.alert('info', 'Pedido interno',
        `El lote ${o.id_lote} pertenece a la tienda y no se puede facturar.`, 1500);
      return;
    }

    if (estado === 'FACTURADO') {
      this.uiSvc.alert('info', 'Pedido ya facturado',
        `El pedido del lote ${o.id_lote} ya está marcado como facturado.`, 1500);
      return;
    }

    this.uiSvc.confirm({
      title: 'Facturar pedido',
      message: `¿Confirma que desea marcar el pedido de tueste del lote ${o.id_lote} como facturado?`,
      confirmText: 'Sí',
      cancelText: 'No'
    }).then(confirmed => {
      if (confirmed) {
        this.pedidoSvc.setFacturado(o.id_pedido).subscribe(updated => {
          this.allHistoryRoasts = this.allHistoryRoasts.map(p =>
            p.id_pedido === updated.id_pedido ? { ...p, facturado: true } : p
          );
          this.applyFilter();
        });
      }
    });
  }

  toggleAllRoasts() {
    this.showAllRoasts = !this.showAllRoasts;
  }

  applyAllRoastsFilter() {

    const desde = this.startDate ? new Date(this.startDate) : null;
    const hasta = this.endDate ? new Date(this.endDate + 'T23:59:59') : null;
    const cliente = this.selectedClientId;

    this.filteredAllRoasts = this.allRoasts.filter(t => {
      const fecha = new Date(t.fecha_tueste!);

      const inRange =
        (!desde || fecha >= desde) &&
        (!hasta || fecha <= hasta);

      const clientMatch =
        !cliente || t.id_cliente === cliente;

      return inRange && clientMatch;
    });
  }

  onFilterChange() {
    this.applyFilter();
    this.applyAllRoastsFilter();
  }

  private applyFilter() {
    const desde = this.startDate ? new Date(this.startDate) : null;
    const hasta = this.endDate ? new Date(this.endDate) : null;
    const nivel = this.historyLevel;

    this.filteredHistoryRoasts = this.allHistoryRoasts.filter(h => {
      const fecha = new Date(h.fecha_tueste!);
      const inRange = (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
      const nivelMatch = !nivel || h.comentario === `Tueste ${nivel}`;
      const clientMatch = !this.selectedClientId || h.id_user === this.selectedClientId;
      return inRange && nivelMatch && clientMatch;
    });

    // 👇 Sin facturar: NO_FACTURADO dentro del mismo filtro
    this.sinFacturarRoasts = this.filteredHistoryRoasts.filter(h =>
      this.getEstadoFacturacion(h) === 'NO_FACTURADO'
    );

    this.totalPages = Math.ceil(this.filteredHistoryRoasts.length / this.pageSize) || 1;
    this.totalPagesSF = Math.ceil(this.sinFacturarRoasts.length / this.pageSize) || 1;
    this.page = 1;
    this.pageSF = 1;
    this.updatePagedHistory();
    this.updatePagedSinFacturar();
  }

  updatePagedSinFacturar() {
    const start = (this.pageSF - 1) * this.pageSize;
    this.pagedSinFacturar = this.sinFacturarRoasts.slice(start, start + this.pageSize);
  }

  changePageSF(delta: number) {
    const next = this.pageSF + delta;
    if (next < 1 || next > this.totalPagesSF) return;
    this.pageSF = next;
    this.updatePagedSinFacturar();
  }

  openRoasts(o: Pedido): void {
    this.router.navigate(['/roasts', o.id_pedido, 'tuestes']);
  }

  openAddRoaster(): void {
    this.router.navigate(['/roasts/tueste/nuevo']);
  }

  onEditRoast(o: Pedido): void {
    this.router.navigate(['/roasts/tueste', o.id_pedido, 'editar']);
  }

  onRoasterCreated(data: any) {
    this.showAddRoaster = false;
    this.loadPending();
    this.loadHistory();
  }

  onDeleteOrder(o: Pedido) {
    this.uiSvc.confirm({
      title: 'Eliminar orden',
      message: `¿Estás seguro de que deseas eliminar la orden de tueste de ${o.id_lote}?`,
      confirmText: 'Sí',
      cancelText: 'No'
    }).then(confirmed => {
      if (confirmed) {
        this.pedidoSvc.deletePedido(o.id_pedido).subscribe(() => {
          this.loadPending();
          this.loadHistory();
        });
      }
    });
  }

  onFichaTueste(t: string) {
    this.selectedTuesteId = t;
    this.showFichaTueste = true;
  }

  openAddBalonGas() {
    this.showAddBalonGas = true;
  }

  onBalonGasCreated() {
    this.showAddBalonGas = false;
  }

  updatePagedHistory() {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedHistoryRoasts = this.filteredHistoryRoasts.slice(start, end);
  }

  changePage(delta: number) {
    const next = this.page + delta;
    if (next < 1 || next > this.totalPages) return;
    this.page = next;
    this.updatePagedHistory();
  }

  exportHistoryToExcel() {

    /* ===============================
     * HOJA 1 – HISTORIAL DE PEDIDOS
     * =============================== */
    const pedidosSheet = this.filteredHistoryRoasts.map(h => {
      const cliente = h.owned_by_store
        ? 'FORTUNATO'
        : (this.clients.find(c => c.id_user === h.lote?.id_user)?.nombre ?? 'Desconocido');
      return {
        id_pedido: h.id_pedido,
        Lote: h.id_lote,
        Fecha: h.fecha_tueste,
        Cliente: cliente,
        Cantidad: h.cantidad,
        'Tipo de Tueste': h.comentario,
        Facturado: h.facturado ? 'Sí' : 'No',
      };
    });

    const wsPedidos = XLSX.utils.json_to_sheet(pedidosSheet);


    /* ===============================
     * HOJA 2 – TUESTES (DETALLE)
     * =============================== */
    const tuestesSheet = this.filteredAllRoasts.map(t => ({
      id_pedido: t.id_pedido,
      Lote: t.id_lote,
      Fecha: t.fecha_tueste,
      Tostadora: t.tostadora,
      Densidad: t.densidad,
      Humedad: t.humedad,
      'Peso de Entrada': t.peso_entrada,
      'Temperatura de Entrada': t.temperatura_entrada,
      'Llama Inicial': t.llama_inicial,
      'Aire Inicial': t.aire_inicial,
      'Punto De No Retorno': t.punto_no_retorno,
      'Temperatura de Salida': t.temperatura_salida,
      'Tiempo Total': t.tiempo_total,
      '%Caramelizacion': t.porcentaje_caramelizacion,
      Desarrollo: t.desarrollo,
      'Grados de Desarrollo': t.grados_desarrollo,
      'Peso de Salida ': t.peso_salida,
      Merma: t.merma,
      'Agtron Comercial': t.agtrom_comercial,
      'Agtron Gourmet': t.agtrom_gourmet,
    }));

    const wsTuestes = XLSX.utils.json_to_sheet(tuestesSheet);


    /* ===============================
     * WORKBOOK
     * =============================== */
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, wsPedidos, 'Historial Pedidos Tueste');
    XLSX.utils.book_append_sheet(wb, wsTuestes, 'Detalle Tuestes');

    const buffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob = new Blob([buffer], { type: 'application/octet-stream' });

    const fileName = this.buildExportFileName();
    saveAs(blob, fileName);

  }

  private buildExportFileName(): string {
    const parts: string[] = ['tuestes'];

    // fechas
    if (this.startDate && this.endDate) {
      parts.push(`${this.startDate}_a_${this.endDate}`);
    } else if (this.startDate) {
      parts.push(this.startDate);
    } else if (this.endDate) {
      parts.push(this.endDate);
    }

    // cliente
    if (this.selectedClientId) {
      const client = this.clients.find(c => c.id_user === this.selectedClientId);
      if (client?.nombre) {
        const safeName = client.nombre.replace(/\s+/g, '-').toUpperCase();
        parts.push(safeName);
      }
    }

    return parts.join('_') + '.xlsx';
  }

  // ── Total de batches y agrupación por día (solo Pendientes) ──
  get totalBatchesPendientes(): number {
    return this.pendingOrders.reduce((sum, o) => sum + (o.pesos?.length || 0), 0);
  }

  get batchesPorDia(): { fecha: string; batches: number; ordenes: number }[] {
    const mapa = new Map<string, { batches: number; ordenes: number }>();

    for (const o of this.pendingOrders) {
      if (!o.fecha_tueste) continue;
      const clave = new Date(o.fecha_tueste).toISOString().split('T')[0]; // yyyy-MM-dd
      const actual = mapa.get(clave) ?? { batches: 0, ordenes: 0 };
      actual.batches += o.pesos?.length || 0;
      actual.ordenes += 1;
      mapa.set(clave, actual);
    }

    return [...mapa.entries()]
      .map(([fecha, { batches, ordenes }]) => ({ fecha, batches, ordenes }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  // ── Tab principal (Pendientes / Histórico) ──
  setPendingTab(tab: 'pendientes' | 'historico'): void {
    this.pendingTab = tab;
  }

  // ── Sub-tabs de Pendientes (Todos / por día) ──
  setPendingSubTab(subTab: string): void {
    this.pendingSubTab = subTab;
    this.pagePendientes = 1;
  }

  get ordenesPendientesFiltradas(): PedidoConLote[] {
    if (this.pendingSubTab === 'todos') {
      return this.pendingOrders;
    }
    return this.pendingOrders.filter(o => {
      if (!o.fecha_tueste) return false;
      return new Date(o.fecha_tueste).toISOString().split('T')[0] === this.pendingSubTab;
    });
  }

  get totalPagesPendientes(): number {
    return Math.ceil(this.ordenesPendientesFiltradas.length / this.pageSizePendientes) || 1;
  }

  get pagedPendientes(): PedidoConLote[] {
    const start = (this.pagePendientes - 1) * this.pageSizePendientes;
    return this.ordenesPendientesFiltradas.slice(start, start + this.pageSizePendientes);
  }

  changePagePendientes(delta: number): void {
    const next = this.pagePendientes + delta;
    if (next < 1 || next > this.totalPagesPendientes) return;
    this.pagePendientes = next;
  }
}