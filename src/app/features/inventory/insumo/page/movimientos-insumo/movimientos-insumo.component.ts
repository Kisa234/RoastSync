import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Package, Warehouse, CalendarDays } from 'lucide-angular';

import { InventarioInsumo } from '../../../../../shared/models/inventario-insumo';
import { InsumoService } from '../../service/insumo.service';
import { CategoriaInsumoPipe } from "../../../../../shared/pipes/categoria-insumo.pipe";
import { InsumoConInventarios } from '../../../../../shared/models/insumo';

@Component({
  selector: 'app-movimientos-insumo-page',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgFor,
    DatePipe,
    RouterModule,
    LucideAngularModule,
    CategoriaInsumoPipe
  ],
  templateUrl: './movimientos-insumo.component.html',
})
export class MovimientosInsumoPageComponent implements OnInit {
  insumo: InsumoConInventarios | null = null;
  inventariosInsumo: InventarioInsumo[] = [];

  loading = true;
  error = '';

  ArrowLeft = ArrowLeft;
  Package = Package;
  Warehouse = Warehouse;
  CalendarDays = CalendarDays;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private insumoService: InsumoService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'No se encontró el id del insumo.';
      this.loading = false;
      return;
    }

    this.loadData(id);
  }

  loadData(id: string): void {
    this.loading = true;
    this.error = '';

    this.insumoService.getInsumoConInventariosById(id).subscribe({
      next: (insumo) => {
        console.log('Insumo con inventarios cargado:', insumo);
        this.insumo = insumo;
        this.inventariosInsumo = insumo.inventarios ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando movimientos del insumo', err);
        this.error = 'No se pudo cargar la información del insumo.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/inventory/insumos']);
  }

  trackByInventario(_: number, item: InventarioInsumo): string {
    return item.id_inventario;
  }

  get stockActual(): number {
    if (!this.insumo) return 0;
    return this.insumo.stock_total ?? 0;
  }

  get totalInventarios(): number {
    return this.inventariosInsumo.length;
  }

  get inventariosOrdenados(): InventarioInsumo[] {
    return [...this.inventariosInsumo].sort((a, b) => {
      const fa = new Date(a.fecha_registro).getTime();
      const fb = new Date(b.fecha_registro).getTime();
      return fb - fa;
    });
  }

  get fechaPrimerRegistro(): string | null {
    if (!this.insumo?.fecha_primer_registro) return null;
    return String(this.insumo.fecha_primer_registro);
  }

  get stockInicialReferencial(): number {
    if (!this.insumo) return 0;
    return this.insumo.stock_inicial_referencial ?? 0;
  }
}