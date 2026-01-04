import { User } from './../../../shared/models/user';
// src/app/features/roasts/page/roasts-page.component.ts
import { Component } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Sheet } from 'lucide-angular';
import { X, Check, Eye, Edit, Trash, ReceiptText } from 'lucide-angular';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


import { AddRoasterComponent } from '../components/add-order-roast/add-order-roast.component';
import { Pedido } from '../../../shared/models/pedido';
import { PedidoService } from '../../orders/service/orders.service';
import { UserService } from '../../users/service/users-service.service';
import { catchError, map, Observable, of } from 'rxjs';
import { OrderRoastsComponent } from '../components/order-roasts/order-roasts.component';
import { EditRoastComponent } from '../components/edit-roast/edit-roast.component';
import { EditOrderComponent } from '../components/edit-order/edit-order.component';
import { UiService } from '../../../shared/services/ui.service';
import { LoteTostado } from '../../../shared/models/lote-tostado';
import { FichaTuesteComponent } from "../../../shared/components/ficha-tueste/ficha-tueste.component";
import { RoastsService } from '../service/roasts.service';
import { Tueste } from '../../../shared/models/tueste';
import { UserNamePipe } from "../../../shared/pipes/user-name-pipe.pipe";
import { MinSecPipe } from "../../../shared/pipes/time.pipe";
import { LoteService } from '../../inventory/service/lote.service';


interface ExtendedPedido extends Pedido {
  userName?: string;
}

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
    OrderRoastsComponent,
    EditOrderComponent,
    FichaTuesteComponent,
    UserNamePipe,
    MinSecPipe
  ],
  templateUrl: './roast-page.component.html',
})
export class RoastsPage {
  readonly Plus = Plus;
  readonly X = X;
  readonly Check = Check;
  readonly Eye = Eye;
  readonly Edit = Edit;
  readonly Trash = Trash;
  readonly Sheet = Sheet;
  readonly ReceiptText = ReceiptText;

  pendingOrders: ExtendedPedido[] = [];
  allHistoryRoasts: ExtendedPedido[] = [];
  filteredHistoryRoasts: ExtendedPedido[] = [];
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

  // paginator 
  page = 1;
  pageSize = 5;
  totalPages = 1;
  pagedHistoryRoasts: ExtendedPedido[] = [];

  // filter client 

  clients: User[] = [];
  selectedClientId = '';


  constructor(
    private loteSvc: LoteService,
    private pedidoSvc: PedidoService,
    private roastsSvc: RoastsService,
    private userSvc: UserService,
    private uiSvc: UiService,
  ) { }

  ngOnInit() {
    this.loadPending();
    this.loadHistory();
    this.loadClients();
    this.loadAllRoasts();
  }

  loadClients() {
    this.userSvc.getUsers().subscribe(list => {
      this.clients = list;
    });
  }


  private loadPending() {
    this.pedidoSvc.getPedidosByEstado('Pendiente')
      .pipe(
        map(list => list.filter(p => p.tipo_pedido === 'Orden Tueste'))
      )
      .subscribe(list => {
        // Copiamos en ExtendedPedido[]
        this.pendingOrders = list.map(p => ({ ...p }));
        // Por cada pedido, pedimos el nombre
        this.pendingOrders.forEach(p => {
          this.userSvc.getUserById(p.id_user).subscribe(
            user => p.userName = user?.nombre || 'Desconocido',
            () => p.userName = 'Desconocido'
          );
        });
      });
  }

  loadHistory() {
    this.pedidoSvc.getPedidosByEstado('Completado').pipe(
      map(list => list.filter(p => p.tipo_pedido === 'Orden Tueste')),
      catchError(() => of([]))
    ).subscribe(list => {
      this.allHistoryRoasts = list.map(p => ({ ...p }));
      // carga userName igual que antes...
      this.allHistoryRoasts.forEach(p =>
        this.userSvc.getUserById(p.id_user).subscribe(
          u => p.userName = u?.nombre ?? 'Desconocido',
          () => p.userName = 'Desconocido'
        )
      );
      // Aplica filtro la primera vez
      this.applyFilter();
    });
  }

  loadAllRoasts() {
    this.roastsSvc.getAllTuestes().subscribe(list => {
      this.allRoasts = list;
      this.filteredAllRoasts = list;
    });
  }

  facturarPedido(o: ExtendedPedido) {

    if (o.facturado) {
      this.uiSvc.alert(
        'info',
        'Pedido ya facturado',
        `El pedido de tueste del lote ${o.id_lote} ya está marcado como facturado.`,
        1500
      );
      return;
    }

    if (o.estadoFacturacion === "ES_NUESTRO") {
      this.uiSvc.alert(
        'info',
        'Pedido de tueste interno',
        `El pedido de tueste del lote ${o.id_lote} es un pedido interno de la empresa y no se puede facturar.`,
        1500
      );
      return;
    }


    this.uiSvc.confirm({
      title: 'Facturar pedido',
      message: `¿Confirma que desea marcar el pedido de tueste del lote ${o.id_lote} como facturado?`,
      confirmText: 'Sí',
      cancelText: 'No'
    }).then(
      confirmed => {
        if (confirmed) {
          this.pedidoSvc.setFacturado(o.id_pedido).subscribe(updated => {
            this.allHistoryRoasts = this.allHistoryRoasts.map(p =>
              p.id_pedido === updated.id_pedido ? { ...p, estadoFacturacion: "FACTURADO" } : p
            );

            this.applyFilter();
          });

        }
      }
    )

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
    const nivel = this.historyLevel; // e.g. "Claro"

    this.filteredHistoryRoasts = this.allHistoryRoasts.filter(h => {
      const fecha = new Date(h.fecha_tueste!);
      // rango de fechas
      const inRange =
        (!desde || fecha >= desde) &&
        (!hasta || fecha <= hasta);

      // nivel de tueste: el comentario es "Tueste Claro"/"Tueste Medio"/…
      const nivelMatch =
        !nivel ||
        h.comentario === `Tueste ${nivel}`;

      const clientMatch =
        !this.selectedClientId || h.id_user === this.selectedClientId;

      return inRange && nivelMatch && clientMatch;
    });

    this.totalPages = Math.ceil(this.filteredHistoryRoasts.length / this.pageSize) || 1;
    this.page = 1;
    this.updatePagedHistory();
  }

  openAddRoaster() {
    this.showAddRoaster = true;
  }

  openRoasts(o: Pedido) {
    this.selectedOrder = o;
    this.showRoastsModal = true;
  }

  onEditRoast(o: Pedido) {
    this.selectedOrder = o;
    this.showEditRoastModal = true;
    this.loadPending();
    this.loadHistory();
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
    const pedidosSheet = this.filteredHistoryRoasts.map(h => ({
      id_pedido: h.id_pedido,
      Lote: h.id_lote,
      Fecha: h.fecha_tueste,
      Cliente: h.userName ?? h.id_user,
      Cantidad: h.cantidad,
      'Tipo de Tueste': h.comentario,
      Facturado: h.facturado ? 'Sí' : 'No',
    }));

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





}
