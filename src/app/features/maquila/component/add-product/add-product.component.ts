import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Check } from 'lucide-angular';
import { ProductoService } from '../../service/producto.service';
import { Producto } from '../../../../shared/models/producto';
import { LoteService } from '../../../inventory/service/lote.service';
import { SelectSearchComponent } from '../../../../shared/components/select-search/select-search.component';
import { Lote } from '../../../../shared/models/lote';
import { UserService } from '../../../users/service/users-service.service';
import { combineLatest, map } from 'rxjs';
import { UiService } from '../../../../shared/services/ui.service';

@Component({
  selector: 'add-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    SelectSearchComponent
  ],
  templateUrl: './add-product.component.html'
})
export class AddProductComponent implements OnInit {

  // icons
  readonly X = X;
  readonly Check = Check;

  // outputs
  @Output() created = new EventEmitter<Producto>();
  @Output() close = new EventEmitter<void>();

  // ui state
  saving = false;
  error: string | null = null;

  // form model
  model: Producto ={
    id_producto: '',
    nombre: '',
    activo: false,
    fecha_registro: ''
  }

  lotes: Lote[] = [];

  constructor(
    private productoService: ProductoService,
    private loteService: LoteService,
    private userService: UserService,
    private uiService: UiService
  ) { }

  ngOnInit(): void {
    combineLatest([
      this.loteService.getAll(),
      this.userService.getUsers()
    ])
      .pipe(
        map(([lotes, users]) => {
          const adminIds = new Set(
            users
              .filter(u => String(u.rol ?? '').toLowerCase() === 'admin')
              .map(u => u.id_user)
          );
          return lotes.filter(l => !!l.id_user && adminIds.has(l.id_user!));
        })
      )
      .subscribe({
        next: lotesAdmin => { this.lotes = lotesAdmin; },
        error: () => { this.error = 'No se pudo cargar lotes/usuarios'; }
      });
  }

  canSave() {
    return this.model.nombre.trim().length > 0 && !this.saving;
  }

  onCancel() {
    if (!this.saving) this.close.emit();
  }

  async save() {
    if (!this.canSave()) return;

    this.error = null;
    this.saving = true;

    try {
      const producto = await this.productoService.create(this.model).toPromise();
      this.created.emit(producto as Producto);
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || 'No se pudo crear el producto';
      this.uiService.alert('error', 'error', e?.error?.error, 2000)
    } finally {
      this.saving = false;
    }
  }
}
