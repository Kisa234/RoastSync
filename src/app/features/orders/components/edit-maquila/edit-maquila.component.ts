import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Check, X } from 'lucide-angular';
import { PedidoService } from '../../service/orders.service';
import { UserService } from '../../../users/service/users-service.service';
import { UiService } from '../../../../shared/services/ui.service';
import { Pedido } from '../../../../shared/models/pedido';
import { SelectSearchComponent } from '../../../../shared/components/select-search/select-search.component';
import { ProductoService } from '../../../products/service/producto.service';
import { LoteTostadoService } from '../../../inventory/service/lote-tostado.service';

@Component({
  selector: 'edit-maquila',
  standalone: true,
  templateUrl: './edit-maquila.component.html',
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    SelectSearchComponent
  ]
})
export class EditMaquilaOrderComponent {
  @Input() pedido!: Pedido;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<Pedido>();

  readonly Check = Check;
  readonly X = X;

  model: any = {
    tipo_pedido: 'Maquila',
    id_user: '',
    id_producto: '',
    id_lote_tostado: '',
    cantidad: null,
    gramaje: 200,
    molienda: 'ENTERO',
    comentario: ''
  };

  clientesOriginal: any[] = [];
  userLote: any = null;
  clientes: any[] = [];
  productos: any[] = [];
  lotesTostados: any[] = [];
  availableQty: number | null = null;
  loading = false;

  constructor(
    private pedidoSvc: PedidoService,
    private userSvc: UserService,
    private productoSvc: ProductoService,
    private loteTostadoSvc: LoteTostadoService,
    private uiSvc: UiService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Inicializar con el pedido actual
    if (this.pedido) this.model = { ...this.pedido };

    // Usuarios (clientes)
    this.userSvc.getUsers().subscribe({
      next: (res) => {
        this.clientesOriginal = res;
        this.clientes = res;
      },
      error: (err) => console.error('Error cargando usuarios:', err)
    });

    // Productos (solo categoría CAT001 y activos)
    this.productoSvc.getProductos().subscribe({
      next: (res) => {
        this.productos = res.filter(
          (p: any) => p.id_categoria === 'CAT001' && p.activo === true
        );
      },
      error: (err) => console.error('Error cargando productos:', err)
    });

    // Lotes tostados
    this.loteTostadoSvc.getAll().subscribe({
      next: (res: any[]) => {
        this.lotesTostados = res.filter(l => l.peso >= 0);

        // Si ya tiene lote seleccionado, actualizar peso disponible
        const lote = this.lotesTostados.find(l => l.id_lote_tostado === this.model.id_lote_tostado);
        if (lote) this.availableQty = lote.peso;
      },
      error: (err: any) => console.error('Error cargando lotes tostados:', err)
    });
  }

  onLoteChange() {
    const lote = this.lotesTostados.find(l => l.id_lote_tostado === this.model.id_lote_tostado);
    if (!lote) return;

    this.availableQty = lote.peso;

    // Obtenemos el usuario dueño del lote
    this.userSvc.getUserById(lote.id_user).subscribe({
      next: (u) => {
        this.userLote = u;

        if (u.rol === 'admin') {
          this.clientes = [...this.clientesOriginal];
        } else {
          this.clientes = this.clientesOriginal.filter(c => c.id_user === u.id_user);
          this.model.id_user = u.id_user;
        }
      },
      error: (err) => console.error('Error obteniendo usuario del lote:', err)
    });
  }

  onCancel() {
    this.close.emit();
  }

  onUpdate() {
    if (!this.model.id_user || !this.model.id_producto || !this.model.id_lote_tostado || !this.model.cantidad) {
      this.uiSvc.alert('warning', 'Campos incompletos', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    this.model.cantidad = Number(this.model.cantidad);
    this.model.gramaje = Number(this.model.gramaje) || 200;

    this.loading = true;

    this.pedidoSvc.updatePedido(this.pedido.id_pedido, this.model).subscribe({
      next: (pedido) => {
        this.uiSvc.alert('success', 'Pedido actualizado', 'El pedido de maquila se actualizó correctamente.');
        this.updated.emit(pedido);
        this.close.emit();
      },
      error: (err) => {
        console.error('Error actualizando pedido:', err);
        this.uiSvc.alert('error', 'Error', 'No se pudo actualizar el pedido.');
        this.loading = false;
      }
    });
  }
}
