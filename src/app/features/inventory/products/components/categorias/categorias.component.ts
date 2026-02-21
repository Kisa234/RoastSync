import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Plus, Edit, Trash2, LucideAngularModule } from 'lucide-angular';
import { CategoriaService } from '../../service/categoria.service';
import { Categoria } from '../../../../shared/models/categoria';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddCategoriaComponent } from '../add-categoria/add-categoria.component';
import { EditCategoriaComponent } from '../edit-categoria/edit-categoria.component';
import { UiService } from '../../../../shared/services/ui.service';

@Component({
  selector: 'categorias',
  templateUrl: './categorias.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    AddCategoriaComponent,
    EditCategoriaComponent
  ]
})
export class CategoriasComponent implements OnInit {
  @Output() closes = new EventEmitter<void>();

  categorias: Categoria[] = [];
  selectedCategoria!: Categoria | null;

  showAdd = false;
  showEdit = false;

  Plus = Plus;
  Edit = Edit;
  Trash2 = Trash2;

  constructor(
    private categoriaSvc: CategoriaService,
    private uiSvc: UiService
  ) { }

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias() {
    this.categoriaSvc.getCategorias().subscribe({
      next: (res) => (this.categorias = res),
      error: (err) => console.error('Error cargando categorías:', err)
    });
  }

  close() {
    this.closes.emit();
  }

  // 🔹 Modales
  openAddCategoria() {
    this.showAdd = true;
  }

  openEdit(categoria: Categoria) {
    this.selectedCategoria = categoria;
    this.showEdit = true;
  }

  reloadCategorias() {
    this.loadCategorias();
  }

  closeChildModals() {
    this.showAdd = false;
    this.showEdit = false;
    this.selectedCategoria = null;
  }

  async openDelete(categoria: Categoria) {
    const ok = await this.uiSvc.confirm({
      title: 'Eliminar Categoría',
      message: `¿Seguro que deseas eliminar la categoría "${categoria.nombre}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });

    if (!ok) return;

    this.categoriaSvc.deleteCategoria(categoria.id_categoria).subscribe({
      next: () => {
        this.uiSvc.alert(
          'success',
          'Categoría eliminada',
          `La categoría "${categoria.nombre}" se eliminó correctamente.`
        );
        this.loadCategorias();
      },
      error: (err) => {
        console.error('Error eliminando categoría:', err);
        this.uiSvc.alert(
          'error',
          'Error',
          'No se pudo eliminar la categoría. Inténtalo nuevamente.'
        );
      }
    });
  }
}
