import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LoteService } from '../../../inventory/lotes-verdes/service/lote.service';

import { UserService } from '../../../users/service/users-service.service';
import { Lote } from '../../../../shared/models/lote';

@Component({
  selector: 'app-costing',
  standalone: true,
  templateUrl: './costing.component.html',
  imports: [CommonModule, FormsModule],
})
export class CostingComponent implements OnInit {
  lotes: Lote[] = [];
  lote?: Lote;

  // =====================
  // VARIABLES (Inputs del Excel)
  // =====================
  precioVerde: number = 0;          // x : Precio en Verde
  mermaPorcentaje: number = 15;     // y%: Merma en Tostado (15% por defecto)
  gastosLogisticos: number = 5;     // z : Precio del tostado / Gastos
  pesoGramos: number = 250;         // a : Peso del café en gramos
  costosEmpaque: number = 1.5;      // b : Precio bolsa, etiqueta, mano de obra
  precioVenta: number = 35;         // M : Precio de Venta
  cantidadVolumen: number = 1;      // N : Kilos o Bolsas
  comisionPorcentaje: number = 0;   // P%: Comisión Vendedor
  igvPorcentaje: number = 18;       // Q%: IGV (0, 10 o 18)
  gananciaMinimaRecomend: number = 30; // GmR%: Ganancia mínima recomendada

  constructor(
    private loteSvc: LoteService,
    private userSvc: UserService
  ) { }

  ngOnInit(): void {
    this.loadLotes();
  }

  loadLotes(): void {
      this.loteSvc.getLotesOwnedByStore().subscribe(lotes => {
        this.lotes = lotes;
      });

  }

  // Cuando selecciona un lote, extraemos su costo (x)
  onLoteChange(): void {
    if (this.lote) {
      this.precioVerde = this.lote.costo ?? 0;
    } else {
      this.precioVerde = 0;
    }
  }

  // =====================
  // CÁLCULOS (Fórmulas del Excel)
  // =====================

  // CRT: Costo Real del Tostado (por Kilo)
  get crt(): number {
    const factorMerma = 1 - (this.mermaPorcentaje / 100);
    if (factorMerma <= 0) return 0;
    return (this.precioVerde + this.gastosLogisticos) / factorMerma;
  }

  // MET: Costo del café proporcional al peso de la bolsa
  get met(): number {
    return (this.crt / 1000) * this.pesoGramos;
  }

  // CV: Comisión del Vendedor
  get cv(): number {
    return this.precioVenta * (this.comisionPorcentaje / 100);
  }

  // IGVV: IGV Final
  get igvv(): number {
    return this.precioVenta * (this.igvPorcentaje / 100);
  }

  // CdP: Costo Total del Producto (Unidad)
  get cdp(): number {
    return this.met + this.costosEmpaque + this.cv + this.igvv;
  }

  // G: Ganancia Neta Unitaria
  get ganancia(): number {
    return this.precioVenta - this.cdp;
  }

  // GnV: Ganancia en Volumen
  get gananciaVolumen(): number {
    return this.ganancia * this.cantidadVolumen;
  }

  // PdGa: Porcentaje de Ganancia (Margen Real)
  get porcentajeGanancia(): number {
    const ventaSinIgv = this.precioVenta - this.igvv;
    if (ventaSinIgv <= 0) return 0;
    const costoSinIgv = this.cdp - this.igvv;
    return (1 - (costoSinIgv / ventaSinIgv)) * 100;
  }

  // VRec: Venta Recomendada
  get ventaRecomendada(): number {
    const costoBase = this.met + this.costosEmpaque;
    const margenDeseado = costoBase * (this.gananciaMinimaRecomend / 100);
    const totalSinIgv = margenDeseado + costoBase + this.cv;
    const factorIgv = 1 + (this.igvPorcentaje / 100);
    return totalSinIgv * factorIgv;
  }
}