import { CommonModule, DatePipe, NgClass, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Check, Edit2, Eye, Factory, LucideAngularModule, Plus, Trash2 } from 'lucide-angular';
import { AddOrderComponent } from '../../components/add-order/add-order.component';
import { AddMaquilaOrderComponent } from '../../components/add-maquila/add-maquila.component';
import { EditOrderComponent } from '../../components/edit-order/edit-order.component';
import { EditMaquilaOrderComponent } from '../../components/edit-maquila/edit-maquila.component';
import { ViewOrderComponent } from '../../components/view-order/view-order.component';
import { UserNamePipe } from '../../../../shared/pipes/user-name-pipe.pipe';
import { Pedido } from '../../../../shared/models/pedido';
import { PedidoService } from '../../service/orders.service';
import { UiService } from '../../../../shared/services/ui.service';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgFor,
    NgClass,
    DatePipe,
    LucideAngularModule,
    AddOrderComponent,
    AddMaquilaOrderComponent,
    EditOrderComponent,
    EditMaquilaOrderComponent,
    ViewOrderComponent,
    UserNamePipe
  ],
  templateUrl: './orders-page.component.html'
})
export class OrdersPage {
  readonly Plus = Plus;
  readonly Eye = Eye;
  readonly Edit2 = Edit2;
  readonly Trash2 = Trash2;
  readonly Check = Check;
  readonly Factory = Factory;

  pedidos: Pedido[] = [];
  pedidosCompletados: Pedido[] = [];
  filteredPedidosCompletados: Pedido[] = [];

  searchTerm = '';
  selectedDate = '';
  selectedTipoPedido = '';

  selectedOrderId!: string;
  selectedPedido: Pedido | null = null;

  showAddOrder = false;
  showAddMaquilaOrder = false;
  showEditOrder = false;
  showViewOrder = false;

  currentPage = 1;
  pageSize = 10;

  constructor(
    private pedidoSvc: PedidoService,
    private uiSvc: UiService
  ) {}

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.pedidoSvc.getPedidos().subscribe({
      next: (list) => {
        const filtrados = list.filter(p => p.tipo_pedido !== 'Orden Tueste');

        this.pedidos = filtrados.filter(
          p => (p.estado_pedido || '').toLowerCase() === 'pendiente'
        );

        this.pedidosCompletados = filtrados.filter(
          p => (p.estado_pedido || '').toLowerCase() === 'completado'
        );

        this.applyFilters();
      },
      error: (err) => console.error('Error cargando pedidos:', err)
    });
  }

  openAdd() {
    this.showAddOrder = true;
  }

  openAddMaquila() {
    this.showAddMaquilaOrder = true;
  }

  onOrderCreated(_: Pedido) {
    this.showAddOrder = false;
    this.getData();
  }

  onMaquilaCreated(_: Pedido) {
    this.showAddMaquilaOrder = false;
    this.getData();
  }

  view(p: Pedido) {
    this.selectedOrderId = p.id_pedido;
    this.showViewOrder = true;
  }

  edit(p: Pedido) {
    this.selectedOrderId = p.id_pedido;
    this.selectedPedido = p;
    this.showEditOrder = true;
  }

  onOrderEdit(_: Pedido) {
    this.showEditOrder = false;
    this.getData();
  }

  onMaquilaEdit(_: Pedido) {
    this.showEditOrder = false;
    this.getData();
  }

  delete(p: Pedido) {
    this.uiSvc.confirm({
      title: 'Eliminar Pedido',
      message: '¿Está seguro de eliminar este pedido?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    }).then((ok) => {
      if (ok) {
        this.pedidoSvc.deletePedido(p.id_pedido).subscribe(() => this.getData());
      }
    });
  }

  complete(p: Pedido) {
    this.uiSvc.confirm({
      title: 'Completar Pedido',
      message: '¿Desea marcar el pedido como completado?',
      confirmText: 'Completar',
      cancelText: 'Cancelar'
    }).then((ok) => {
      if (ok) {
        this.pedidoSvc.completarPedido(p.id_pedido).subscribe(() => this.getData());
      }
    });
  }

  applyFilters() {
    const term = this.searchTerm.trim().toLowerCase();
    const selectedDate = this.selectedDate;
    const selectedTipo = this.selectedTipoPedido.trim().toLowerCase();

    this.filteredPedidosCompletados = this.pedidosCompletados.filter((p) => {
      const lote = `${p.id_lote ?? ''} ${p.id_lote_tostado ?? ''}`.toLowerCase();
      const usuario = `${p.usuario_nombre ?? p.id_user ?? ''}`.toLowerCase();
      const tipoPedido = `${p.tipo_pedido ?? ''}`.toLowerCase();

      const matchesSearch =
        !term ||
        lote.includes(term) ||
        usuario.includes(term);

      const matchesDate =
        !selectedDate ||
        this.formatDateOnly(p.fecha_registro) === selectedDate;

      const matchesTipo =
        !selectedTipo ||
        tipoPedido === selectedTipo;

      return matchesSearch && matchesDate && matchesTipo;
    });

    this.currentPage = 1;
    this.adjustCurrentPage();
  }

  formatDateOnly(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onFiltersChange() {
    this.applyFilters();
  }

  clearDateFilter() {
    this.selectedDate = '';
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedDate = '';
    this.selectedTipoPedido = '';
    this.applyFilters();
  }

  get totalPedidos(): number {
    return this.filteredPedidosCompletados.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalPedidos / this.pageSize) || 1;
  }

  get paginatedPedidos(): Pedido[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredPedidosCompletados.slice(start, end);
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (current >= total - 2) {
      return [total - 4, total - 3, total - 2, total - 1, total];
    }

    return [current - 2, current - 1, current, current + 1, current + 2];
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.adjustCurrentPage();
  }

  adjustCurrentPage() {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
  }

  getEstadoClass(estado: string): string {
    switch ((estado || '').toLowerCase()) {
      case 'completado':
        return 'bg-green-100 text-green-700';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelado':
        return 'bg-red-100 text-red-700';
      case 'en proceso':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }
}