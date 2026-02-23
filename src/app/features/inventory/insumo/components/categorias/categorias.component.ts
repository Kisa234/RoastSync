import { UiService } from './../../../../../shared/services/ui.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Pencil, Trash2 } from 'lucide-angular';

import { CategoriaInsumo } from '../../../../../shared/models/categoria-insumo';
import { CategoriaInsumoService } from '../../service/categoria-insumo.service';

import { CreateCategoriaComponent } from '../create-categoria/create-categoria.component';
import { EditCategoriaComponent } from '../edit-categoria/edit-categoria.component';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    CreateCategoriaComponent,
    EditCategoriaComponent
  ],
  templateUrl: './categorias.component.html',
})
export class CategoriasComponent implements OnInit {

  @Output() close = new EventEmitter<void>();

  Plus = Plus;
  Pencil = Pencil;
  Trash2 = Trash2;

  categorias: CategoriaInsumo[] = [];
  loading = false;

  // modal hijo
  showCreate = false;
  showEdit = false;
  selectedCategoria: CategoriaInsumo | null = null;

  constructor(
    private categoriaService: CategoriaInsumoService,
    private uiService: UiService
  ) { }

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias() {
    this.loading = true;
    this.categoriaService.getAll().subscribe({
      next: (data) => {
        this.categorias = data;
        this.loading = false;
      },
      error: () => {
        this.categorias = [];
        this.loading = false;
      }
    });
  }

  async openDelete(categoria: CategoriaInsumo) {
    const ok = await this.uiService.confirm({
      title: 'Eliminar Categoría',
      message: `¿Seguro que deseas eliminar la categoría "${categoria.nombre}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });

    if (!ok) return;

    this.categoriaService.delete(categoria.id_categoria).subscribe({
      next: () => {
        this.uiService.alert(
          'success',
          'Categoría eliminada',
          `La categoría "${categoria.nombre}" se eliminó correctamente.`
        );
        this.loadCategorias();
      },
      error: (err) => {
        console.error('Error eliminando categoría:', err);
        this.uiService.alert(
          'error',
          'Error',
          'No se pudo eliminar la categoría. Inténtalo nuevamente.'
        );
      }
    });
  }

  openAdd() {
    this.showCreate = true;
  }

  openEdit(c: CategoriaInsumo) {
    this.selectedCategoria = c;
    this.showEdit = true;
  }

  closeChildModals() {
    this.showCreate = false;
    this.showEdit = false;
    this.selectedCategoria = null;
  }

  reloadCategorias() {
    this.loadCategorias();
  }

  onClose() {
    this.close.emit();
  }
}