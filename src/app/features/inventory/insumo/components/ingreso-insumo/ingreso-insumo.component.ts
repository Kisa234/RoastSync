import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Almacen } from '../../../../../shared/models/almacen';
import { Insumo } from '../../../../../shared/models/insumo';

import { AlmacenService } from '../../../almacenes/service/almacen.service';
import { InsumoService } from '../../service/insumo.service';
import { InventarioInsumoService } from '../../service/inventario-insumo.service';

export interface CreateIngresoInsumoForm {
  id_insumo: string;
  id_almacen: string;
  cantidad: number;
  precio_compra: number;
}

@Component({
  selector: 'app-ingreso-insumo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ingreso-insumo.component.html',
})
export class IngresoInsumoComponent implements OnInit {

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  loading = false;

  almacenes: Almacen[] = [];
  insumos: Insumo[] = [];

  form: CreateIngresoInsumoForm = {
    id_insumo: '',
    id_almacen: '',
    cantidad: 0,
    precio_compra: 0
  };

  constructor(
    private almacenService: AlmacenService,
    private insumoService: InsumoService,
    private inventarioInsumoService: InventarioInsumoService
  ) {}

  ngOnInit(): void {
    this.getAlmacenes();
    this.getInsumos();
  }

  getAlmacenes(): void {
    this.almacenService.getAlmacenesActivos().subscribe({
      next: (data) => this.almacenes = data,
      error: (err) => console.error('Error al cargar almacenes', err)
    });
  }

  getInsumos(): void {
    this.insumoService.getAll().subscribe({
      next: (data) => this.insumos = data,
      error: (err) => console.error('Error al cargar insumos', err)
    });
  }

  get insumosActivos(): Insumo[] {
    return this.insumos.filter(i => i.activo);
  }

  save(): void {
    if (this.loading) return;
    if (!this.form.id_insumo || !this.form.id_almacen || this.form.cantidad <= 0) return;

    this.loading = true;

    this.inventarioInsumoService.create(this.form as any).subscribe({
      next: () => {
        this.loading = false;
        this.saved.emit();
        this.close.emit();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al crear ingreso de insumo', err);
      }
    });
  }
}