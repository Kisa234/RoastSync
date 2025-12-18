import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LoteService } from './../../inventory/service/lote.service';
import { UserService } from '../../users/service/users-service.service';
import { Lote } from '../../../shared/models/lote';

type TipoCafe = 'basico' | 'selecto' | 'especial' | 'exclusivo';
type Escala = 'escala1' | 'escala2';

@Component({
  selector: 'app-costing',
  standalone: true,
  templateUrl: './costing.component.html',
  imports: [CommonModule, FormsModule],
})
export class CostingComponent implements OnInit {

  constructor(
    private loteSvc: LoteService,
    private userSvc: UserService
  ) { }

  lotes: Lote[] = [];
  lote?: Lote;

  kilos = 1;
  precioVentaManual = 0; // precio unitario de venta
  comision = 0;          // % sobre costo del café

  // 🔥 costo de tueste por clasificación (unitario)
  tostadoPorTipo: Record<TipoCafe, number> = {
    basico: 4,
    selecto: 4.44,
    especial: 5,
    exclusivo: 5.71
  };

  // 📈 margen recomendado por clasificación + escala
  margenPorTipo: Record<TipoCafe, Record<Escala, number>> = {
    basico: { escala1: 0.20, escala2: 0.13 },
    selecto: { escala1: 0.30, escala2: 0.20 },
    especial: { escala1: 0.35, escala2: 0.25 },
    exclusivo: { escala1: 0.40, escala2: 0.33 }
  };

  ngOnInit(): void {
    this.loadLotes();
  }

  loadLotes(): void {
    this.userSvc.getUsers().subscribe(users => {
      const admins = users.filter(u => u.rol === 'admin');
      this.loteSvc.getAll().subscribe(lotes => {
        this.lotes = lotes.filter(l =>
          admins.some(a => a.id_user === l.id_user)
        );
      });
    });
  }

  // =====================
  // HELPERS
  // =====================
  get tipoCafe(): TipoCafe | null {
    if (!this.lote?.clasificacion) return null;

    return this.lote.clasificacion
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') as TipoCafe;
  }


  get escala(): Escala {
    return this.kilos >= 50 ? 'escala2' : 'escala1';
  }

  get costoCafe(): number {
    return this.lote?.costo ?? 0;
  }

  // =====================
  // COSTOS / TOSTADO
  // =====================
  get costoTostado(): number {
    if (!this.tipoCafe) return 0;
    return this.tostadoPorTipo[this.tipoCafe];
  }

  // comisión en soles (unitaria)
  get costoComision(): number {
    return this.costoCafe * (this.comision / 100);
  }

  // =====================
  // GANANCIAS
  // =====================

  // ganancia unitaria = venta - (cafe + comisión)
  get ganancia(): number {
    return this.precioVentaManual - (this.costoCafe + this.costoComision);
  }

  // ganancia unitaria + tostado
  get gananciaConTostado(): number {
    return this.ganancia + this.costoTostado;
  }

  // ganancia por volumen
  get gananciaTotal(): number {
    return this.ganancia * this.kilos;
  }

  // margen real %
  get margenReal(): number {
    return this.costoCafe ? (this.ganancia / this.costoCafe) * 100 : 0;
  }

  // =====================
  // VENTA RECOMENDADA
  // =====================
  get margenRecomendado(): number {
    if (!this.tipoCafe) return 0;
    return this.margenPorTipo[this.tipoCafe][this.escala];
  }

  // venta recomendada unitario (por kilo)
  get ventaRecomendadaUnitaria(): number {
    return this.costoCafe * (1 + this.margenRecomendado);
  }

  // venta recomendada total (por kilos)
  get ventaRecomendadaTotal(): number {
    return this.ventaRecomendadaUnitaria;
  }

  // =====================
  // EVENTS
  // =====================
  onLoteChange(): void {
    this.kilos = 1;
    this.precioVentaManual = 0;
    this.comision = 0;
  }

  onPrecioVentaChange(value: number): void {
    if (value == null || value < 0) this.precioVentaManual = 0;
  }
}
