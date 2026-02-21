import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CategoriaService } from '../../service/categoria.service';
import { Categoria } from '../../../../shared/models/categoria';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AddCategoriaComponent } from '../add-categoria/add-categoria.component';

@Component({
  selector: 'edit-categoria',
  templateUrl: './edit-categoria.component.html',
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
  ]
})
export class EditCategoriaComponent {
  @Input() categoria!: Categoria;
  @Output() closes = new EventEmitter<void>();
  @Output() updated = new EventEmitter<Categoria>();

  form: Partial<Categoria> = {};
  loading = false;

  constructor(private categoriaSvc: CategoriaService) { }

  ngOnInit() {
    this.form = { ...this.categoria };
  }

  update() {
    if (!this.form.nombre?.trim()) return;
    this.loading = true;

    this.categoriaSvc.updateCategoria(this.categoria.id_categoria, this.form).subscribe({
      next: (res) => {
        this.updated.emit(res);
        this.closes.emit();
      },
      error: (err) => {
        console.error('Error al actualizar categoría:', err);
        this.loading = false;
      }
    });
  }

  close(){
    this.closes.emit();
  }
}
