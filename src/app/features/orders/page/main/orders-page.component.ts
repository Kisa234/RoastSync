import { CommonModule, DatePipe, NgClass, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Check, Edit2, Eye, Factory, LucideAngularModule, PackageCheck, Plus, Trash2 } from 'lucide-angular';
import { forkJoin } from 'rxjs';
import { UserNamePipe } from '../../../../shared/pipes/user-name-pipe.pipe';
import { Pedido } from '../../../../shared/models/pedido';
import { PedidoService } from '../../service/orders.service';
import { PaqueteService } from '../../../envios/service/paquete.service';
import { UiService } from '../../../../shared/services/ui.service';

type TabPedidos = 'pendientes' | 'completados';

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
    UserNamePipe
  ],
  templateUrl: './orders-page.component.html'
})
export class OrdersPage implements OnInit {
  readonly Plus = Plus;
  readonly Eye = Eye;
  readonly Edit2 = Edit2;
  readonly Trash2 = Trash2;
  readonly Check = Check;
  readonly Factory = Factory;
  readonly PackageCheck = PackageCheck;

  activeTab: TabPedidos = 'pendientes';

  pedidosPendientes: Pedido[] = [];
  pedidosCompletados: Pedido[] = [];
  filteredPedidos: Pedido[] = [];

  searchTerm = '';
  selectedDate = '';
  selectedTipoPedido = '';

  currentPage = 1;
  pageSize = 10;

  constructor(
    private pedidoSvc: PedidoService,
    private paqueteSvc: PaqueteService,
    private uiSvc: UiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getData();
  }

  getData() {
    forkJoin({
      pendientes: this.pedidoSvc.getPedidosByEstado('Pendiente'),
      completados: this.pedidoSvc.getPedidosByEstado('Completado')
    }).subscribe({
      next: ({ pendientes, completados }) => {
        this.pedidosPendientes = pendientes
          .filter(p => (p.tipo_pedido || '').toLowerCase() !== 'orden tueste')
          .sort((a, b) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime());

        this.pedidosCompletados = completados
          .filter(p => (p.tipo_pedido || '').toLowerCase() !== 'orden tueste')
          .sort((a, b) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime());

        this.applyFilters();
      },
      error: (err) => console.error('Error cargando pedidos:', err)
    });
  }

  setTab(tab: TabPedidos) {
    this.activeTab = tab;
    this.currentPage = 1;
    this.applyFilters();
  }

  get pedidosBase(): Pedido[] {
    return this.activeTab === 'pendientes' ? this.pedidosPendientes : this.pedidosCompletados;
  }

  // ---------- Navegación ----------

  openAdd() { this.router.navigate(['/orders/nuevo']); }
  openAddMaquila() { this.router.navigate(['/orders/maquila/nuevo']); }
  openAddDespacho() { this.router.navigate(['/orders/despacho/nuevo']); }

  edit(p: Pedido) {
    if (p.tipo_pedido === 'Maquila') {
      this.router.navigate(['/orders/maquila', p.id_pedido, 'editar']);
    } else if (p.tipo_pedido === 'OrdenDespacho') {
      this.router.navigate(['/orders/despacho', p.id_pedido, 'editar']);
    } else {
      this.router.navigate(['/orders', p.id_pedido, 'editar']);
    }
  }

  view(p: Pedido) { this.router.navigate(['/orders', p.id_pedido]); }

  // ---------- Acciones ----------

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
      if (!ok) return;

      this.pedidoSvc.completarPedido(p.id_pedido).subscribe({
        next: () => {
          if (p.tipo_pedido === 'OrdenDespacho') {
            this.afterCompletarDespacho(p.id_pedido);
          } else {
            this.getData();
          }
        },
        error: (err) => {
          const msg = err?.error?.error || 'No se pudo completar el pedido.';
          this.uiSvc.alert('error', 'Error', msg);
        }
      });
    });
  }

  /** Al completar una OrdenDespacho, el backend generó un Paquete en EN_PREPARACION.
   *  Se pregunta si quiere ir directo a prepararlo, sin bloquear el refresh de la tabla
   *  aunque diga que no. */
  private afterCompletarDespacho(idPedido: string) {
    this.getData();

    this.paqueteSvc.getByPedidoOrigen(idPedido).subscribe({
      next: (paquete) => {
        if (!paquete) return; // no debería pasar si completarPedido fue exitoso, pero por si acaso

        this.uiSvc.confirm({
          title: 'Paquete generado',
          message: '¿Deseas ir a preparar el paquete ahora?',
          confirmText: 'Ir a preparar',
          cancelText: 'Más tarde'
        }).then((ir) => {
          if (ir) {
            this.router.navigate(['/envios/paquete', paquete.id_paquete]);
          }
        });
      },
      error: () => {
        // El pedido sí se completó — un fallo acá no debe ensuciar ese resultado con un error rojo.
        console.error('[OrdersPage] No se pudo obtener el paquete generado para el pedido', idPedido);
      }
    });
  }

  // ---------- Filtros ----------

  applyFilters() {
    const term = this.searchTerm.trim().toLowerCase();
    const selectedDate = this.selectedDate;
    const selectedTipo = this.selectedTipoPedido.trim().toLowerCase();

    this.filteredPedidos = this.pedidosBase.filter((p) => {
      const lote = `${p.id_lote ?? ''} ${p.id_lote_tostado ?? ''}`.toLowerCase();
      const usuario = p.owned_by_store
        ? 'fortunato'
        : `${p.usuario_nombre ?? p.id_user ?? ''}`.toLowerCase();
      const tipoPedido = `${p.tipo_pedido ?? ''}`.toLowerCase();

      const matchesSearch = !term || lote.includes(term) || usuario.includes(term);
      const matchesDate = !selectedDate || this.formatDateOnly(p.fecha_registro) === selectedDate;
      const matchesTipo = !selectedTipo || tipoPedido === selectedTipo;

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

  clearFilters() {
    this.searchTerm = '';
    this.selectedDate = '';
    this.selectedTipoPedido = '';
    this.applyFilters();
  }

  // ---------- Paginación ----------

  get totalPedidos(): number {
    return this.filteredPedidos.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalPedidos / this.pageSize) || 1;
  }

  get paginatedPedidos(): Pedido[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPedidos.slice(start, start + this.pageSize);
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, 5];
    if (current >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
    return [current - 2, current - 1, current, current + 1, current + 2];
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  goToPreviousPage() { if (this.currentPage > 1) this.currentPage--; }
  goToNextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  adjustCurrentPage() {
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    if (this.currentPage < 1) this.currentPage = 1;
  }

  getEstadoClass(estado: string): string {
    switch ((estado || '').toLowerCase()) {
      case 'completado': return 'bg-green-100 text-green-700';
      case 'pendiente': return 'bg-yellow-100 text-yellow-700';
      case 'cancelado': return 'bg-red-100 text-red-700';
      case 'en proceso': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
}