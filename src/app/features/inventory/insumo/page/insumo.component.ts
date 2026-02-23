import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Filter, Pencil, Eye, Ban, CheckCircle, Search } from 'lucide-angular';
import { Insumo } from '../../../../shared/models/insumo';
import { InsumoService } from '../service/insumo.service';
import { CategoriaInsumoPipe } from "../../../../shared/pipes/categoria-insumo.pipe";
import { CategoriaInsumo } from '../../../../shared/models/categoria-insumo';
import { CategoriaInsumoService } from '../service/categoria-insumo.service';
import { CategoriasComponent } from '../components/categorias/categorias.component';
import { InsumosComponent } from '../components/insumos/insumos.component';

@Component({
  selector: 'app-insumo',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    FormsModule,
    InsumosComponent,
    CategoriasComponent,
    CategoriaInsumoPipe
  ],
  templateUrl: './insumo.component.html',
})
export class InsumoComponent implements OnInit {

  insumos: Insumo[] = [];
  insumosFiltrados: Insumo[] = [];
  categorias: CategoriaInsumo[] = [];

  // MODALES
  showListInsumos = false;
  showListCategorias = false;




  Plus = Plus;
  Filter = Filter;
  Pencil = Pencil;
  Eye = Eye;
  Ban = Ban;
  CheckCircle = CheckCircle;
  Search = Search;

  loading = false;
  onlyActivos = true;

  filterText = '';

  constructor(
    private insumoService: InsumoService,
    private categoriaService: CategoriaInsumoService

  ) { }

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

    const request$ = this.onlyActivos
      ? this.insumoService.getActivos()
      : this.insumoService.getAll();

    request$.subscribe({
      next: (data) => {
        this.insumos = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  toggleActivos() {
    this.onlyActivos = !this.onlyActivos;
    this.loadInsumos();
  }

  setActivo(insumo: Insumo, activo: boolean) {
    this.insumoService.update(insumo.id_insumo, { activo })
      .subscribe(() => this.loadInsumos());
  }

  onSearchChange() {
    this.applyFilter();
  }

  applyFilter() {
    const text = this.filterText.trim().toLowerCase();

    this.insumosFiltrados = this.insumos.filter(i =>
      !text ||
      i.nombre.toLowerCase().includes(text) ||
      i.unidad_medida.toLowerCase().includes(text)
    );
  }

  // MODALES
  openListInsumos() { this.showListInsumos = true; }
  openListCategorias() { this.showListCategorias = true; }

  closeModals() {
    this.showListInsumos = false;
    this.showListCategorias = false;

    this.loadInsumos();
    this.loadCategorias();
  }

}