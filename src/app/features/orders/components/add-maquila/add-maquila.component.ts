import { Component, EventEmitter, Output } from '@angular/core';
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
import { Producto } from '../../../../shared/models/producto';
import { User } from '../../../../shared/models/user';

@Component({
  selector: 'add-maquila',
  standalone: true,
  templateUrl: './add-maquila.component.html',
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    SelectSearchComponent
  ]
})
export class AddMaquilaOrderComponent {
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<Pedido>();

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

  availableQty: number | null = null;
  clientesOriginal: any[] = [];
  userLote: any = null;
  clientes: User[] = [];
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];

  lotesTostados: any[] = [];
  loading = false;

  constructor(
    private pedidoSvc: PedidoService,
    private userSvc: UserService,
    private productoSvc: ProductoService,
    private loteTostadoSvc: LoteTostadoService,
    private uiSvc: UiService
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Usuarios (clientes)
    this.userSvc.getUsers().subscribe({
      next: (res) => {
        this.clientesOriginal = res;
        this.clientes = res;
      },
      error: (err) => console.error('Error cargando usuarios:', err)
    });

    // Productos 
    this.productoSvc.getProductos().subscribe({
      next: (res) => {
        this.productos = res.filter((p: any) => {
          const numeroCategoria = Number(p.id_categoria.replace('CAT', ''));
          return (
            numeroCategoria >= 1 &&
            numeroCategoria <= 10 &&
            p.activo === true
          );
        });
      },
      error: (err) => console.error('Error cargando productos:', err)
    });


    // Lotes tostados con peso >= 0
    this.loteTostadoSvc.getAll().subscribe({
      next: (res: any[]) => {
        this.lotesTostados = res.filter(l => l.peso > 0);
      },
      error: (err: any) => console.error('Error cargando lotes tostados:', err)
    });
  }


  onLoteChange() {
    const lote = this.lotesTostados.find(l => l.id_lote_tostado === this.model.id_lote_tostado);
    if (!lote) return;

    this.availableQty = lote.peso; // ← Guardamos el peso disponible del lote

    const clasificacion = lote.clasificacion.toUpperCase();

    this.productosFiltrados = this.productos.filter(p =>
      p.nombre.toUpperCase().includes(clasificacion)
    );

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

  onSave() {
    if (!this.model.id_user || !this.model.id_producto || !this.model.id_lote_tostado || !this.model.cantidad) {
      this.uiSvc.alert('warning', 'Campos incompletos', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    // Validar tipos
    this.model.cantidad = Number(this.model.cantidad);
    this.model.gramaje = Number(this.model.gramaje) || 200;

    this.loading = true;

    this.pedidoSvc.createPedido(this.model).subscribe({
      next: (pedido) => {
        this.uiSvc.alert('success', 'Pedido de maquila creado', 'El pedido fue registrado correctamente.');
        this.create.emit(pedido);
        this.close.emit();
      },
      error: (err) => {
        console.error('Error creando pedido:', err);
        this.uiSvc.alert('error', 'Error', 'No se pudo crear el pedido de maquila.');
        this.loading = false;
      }
    });
  }

}
