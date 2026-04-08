import { UiService } from './../../../../../shared/services/ui.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Pencil, Trash2 } from 'lucide-angular';

import { Insumo } from '../../../../../shared/models/insumo';
import { CategoriaInsumo } from '../../../../../shared/models/categoria-insumo';

import { InsumoService } from '../../service/insumo.service';
import { CategoriaInsumoService } from '../../service/categoria-insumo.service';

import { CategoriaInsumoPipe } from '../../../../../shared/pipes/categoria-insumo.pipe';
import { CreateInsumoComponent } from '../create-insumo/create-insumo.component';
import { EditInsumoComponent } from '../edit-insumo/edit-insumo.component';

@Component({
  selector: 'app-insumos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    CategoriaInsumoPipe,
    CreateInsumoComponent,
    EditInsumoComponent
  ],
  templateUrl: './insumos.component.html',
})
export class InsumosComponent implements OnInit {

  @Output() close = new EventEmitter<void>();

  Plus = Plus;
  Pencil = Pencil;
  Trash2 = Trash2;

  insumos: Insumo[] = [];
  categorias: CategoriaInsumo[] = [];
  loading = false;

  // modales hijos
  showCreate = false;
  showEdit = false;
  selectedInsumo: Insumo | null = null;

  constructor(
    private insumoService: InsumoService,
    private categoriaService: CategoriaInsumoService,
    private uiService: UiService
  ) {}

  ngOnInit(): void {
    this.loadCategorias();
    this.loadInsumos();
  }

  loadCategorias() {
    this.categoriaService.getAll().subscribe({
      next: (data) => this.categorias = data,
      error: () => this.categorias = []
    });
  }

  loadInsumos() {
    this.loading = true;
    this.insumoService.getAll().subscribe({
      next: (data) => {
        this.insumos = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  // ---------- CREATE ----------
  openAdd() {
    this.showCreate = true;
  }

  // ---------- EDIT ----------
  openEdit(i: Insumo) {
    this.selectedInsumo = i;
    this.showEdit = true;
  }

  // ---------- DELETE ----------
  async openDelete(i: Insumo) {
    const ok = await this.uiService.confirm({
      title: 'Eliminar Insumo',
      message: `¿Seguro que deseas eliminar el insumo "${i.nombre}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });

    if (!ok) return;

    this.insumoService.delete(i.id_insumo).subscribe({
      next: () => {
        this.uiService.alert(
          'success',
          'Insumo eliminado',
          `El insumo "${i.nombre}" se eliminó correctamente.`
        );
        this.loadInsumos();
      },
      error: (err) => {
        console.error('Error eliminando insumo:', err);
        this.uiService.alert(
          'error',
          'Error',
          'No se pudo eliminar el insumo. Inténtalo nuevamente.'
        );
      }
    });
  }

  // ---------- CLOSE CHILD MODALS ----------
  closeChildModals() {
    this.showCreate = false;
    this.showEdit = false;
    this.selectedInsumo = null;
  }

  reloadInsumos() {
    this.loadInsumos();
  }

  onClose() {
    this.close.emit();
  }
}