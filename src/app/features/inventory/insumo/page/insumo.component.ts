import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Plus,
  Pencil,
  Eye,
  Ban,
  CheckCircle,
  Search
} from 'lucide-angular';

import { Insumo } from '../../../../shared/models/insumo';
import { CategoriaInsumo } from '../../../../shared/models/categoria-insumo';
import { InventarioInsumo } from '../../../../shared/models/inventario-insumo';

import { InsumoService } from '../service/insumo.service';
import { CategoriaInsumoService } from '../service/categoria-insumo.service';
import { InventarioInsumoService } from '../service/inventario-insumo.service';

import { CategoriaInsumoPipe } from '../../../../shared/pipes/categoria-insumo.pipe';
import { CategoriasComponent } from '../components/categorias/categorias.component';
import { InsumosComponent } from '../components/insumos/insumos.component';
import { IngresoInsumoComponent } from "../components/ingreso-insumo/ingreso-insumo.component";

type InsumoConStock = Insumo & {
  inventarios: InventarioInsumo[];
  totalStock: number;
};

@Component({
  selector: 'app-insumo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    CategoriaInsumoPipe,
    InsumosComponent,
    CategoriasComponent,
    IngresoInsumoComponent
  ],
  templateUrl: './insumo.component.html',
})
export class InsumoComponent implements OnInit {

  insumos: Insumo[] = [];
  categorias: CategoriaInsumo[] = [];
  inventarios: InventarioInsumo[] = [];

  // lista base y lista filtrada
  insumosConStockAll: InsumoConStock[] = [];
  insumosConStock: InsumoConStock[] = [];

  selectedCategoria: string = '';
  filterText = '';

  // modales
  showListInsumos = false;
  showListCategorias = false;
  showIngresoInsumo = false;
  showMovimientos = false;

  selectedInsumo: InsumoConStock | null = null;

  Plus = Plus;
  Pencil = Pencil;
  Eye = Eye;
  Ban = Ban;
  CheckCircle = CheckCircle;
  Search = Search;

  loading = false;
  onlyActivos = true;

  constructor(
    private insumoService: InsumoService,
    private categoriaService: CategoriaInsumoService,
    private inventarioInsumoService: InventarioInsumoService
  ) { }

  ngOnInit(): void {
    this.loadCategorias();
    this.loadInsumos();
    this.loadInventarios();
  }

  loadCategorias(): void {
    this.categoriaService.getAll().subscribe({
      next: (data) => this.categorias = data,
      error: () => this.categorias = []
    });
  }

  loadInsumos(): void {
    this.loading = true;

    const request$ = this.onlyActivos
      ? this.insumoService.getActivos()
      : this.insumoService.getAll();

    request$.subscribe({
      next: (data) => {
        this.insumos = data;
        this.actualizarStock();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadInventarios(): void {
    this.inventarioInsumoService.getInventarios().subscribe({
      next: (data) => {
        this.inventarios = data;
        this.actualizarStock();
      },
      error: (err) => console.error('Error cargando inventario de insumos', err)
    });
  }

  actualizarStock(): void {
    if (!this.insumos.length || !this.inventarios.length) return;

    this.insumosConStockAll = this.insumos
      .map((i) => {
        const invs = this.inventarios.filter(inv => inv.id_insumo === i.id_insumo);
        const total = invs.reduce((sum, inv) => sum + (inv.cantidad || 0), 0);

        return {
          ...i,
          inventarios: invs,
          totalStock: total
        };
      })
      .filter(i => i.inventarios.length > 0);

    this.applyFilters();
  }

  applyFilters(): void {
    const text = this.filterText.trim().toLowerCase();

    let list = [...this.insumosConStockAll];

    if (this.selectedCategoria) {
      list = list.filter(i => i.id_categoria === this.selectedCategoria);
    }

    if (text) {
      list = list.filter(i =>
        i.nombre.toLowerCase().includes(text) ||
        i.unidad_medida.toLowerCase().includes(text)
      );
    }

    this.insumosConStock = list;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onCategoriaChange(): void {
    this.applyFilters();
  }

  toggleActivos(): void {
    this.onlyActivos = !this.onlyActivos;
    this.loadInsumos();
  }

  setActivo(insumo: Insumo, activo: boolean): void {
    this.insumoService.update(insumo.id_insumo, { activo })
      .subscribe(() => this.loadInsumos());
  }

  // Modales
  openListInsumos(): void {
    this.showListInsumos = true;
  }

  openListCategorias(): void {
    this.showListCategorias = true;
  }

  openIngresoInsumo(): void {
    this.showIngresoInsumo = true;
  }

  closeModals(): void {
    this.showListInsumos = false;
    this.showListCategorias = false;
    this.showIngresoInsumo = false;

    this.loadCategorias();
    this.loadInsumos();
    this.loadInventarios();
  }

  openMovimientos(insumo: InsumoConStock): void {
    this.selectedInsumo = insumo;
    this.showMovimientos = true;
  }

  closeMovimientos(): void {
    this.selectedInsumo = null;
    this.showMovimientos = false;
  }
}