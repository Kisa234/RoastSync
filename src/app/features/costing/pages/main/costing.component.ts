import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LoteService } from '../../../inventory/lotes-verdes/service/lote.service';
import { UserService } from '../../../users/service/users-service.service';
import { Lote } from '../../../../shared/models/lote';
import { PermissionAccessService } from '../../../../shared/services/permission-access.service';

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
  opcionPrecio: string = '';        // Selector del tipo de precio
  precioVerde: number = 0;          // x : Precio en Verde (Valor real usado en cálculos)
  
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
    private userSvc: UserService,
    private permissionSvc: PermissionAccessService
  ) { }

  ngOnInit(): void {
    this.loadLotes();
  }

  loadLotes(): void {
      this.loteSvc.getLotesOwnedByStore().subscribe(lotes => {
        this.lotes = lotes;
      });
  }

  // =====================
  // GESTIÓN DE PRECIOS
  // =====================

  get isAdmin(): boolean {
    try {
      const userRaw = localStorage.getItem('user');
      if (userRaw) {
        const u = JSON.parse(userRaw);
        if (u?.rol?.toLowerCase() === 'admin') return true;
      }
      const rolRaw = localStorage.getItem('rol');
      if (rolRaw && rolRaw.toLowerCase() === 'admin') return true;
      const token = localStorage.getItem('token');
      if (token && token.includes('.')) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload?.rol?.toLowerCase() === 'admin' || payload?.role?.toLowerCase() === 'admin') return true;
      }
    } catch { }
    return this.permissionSvc.hasPermission('costeo.precios-compra.read');
  }

  getPrecioSugerido(l?: Lote): number {
    if (!l) return 0;
    const costo = l.costo ?? 0;
    if (costo === 0) return 0;
    return (costo + 1.20) * 1.5;
  }

  onLoteChange(): void {
    if (this.lote) {
      // Por defecto seleccionamos "sugerido", o "costo" si es admin y quiere verlo.
      this.opcionPrecio = this.isAdmin ? 'costo' : 'sugerido';
      this.aplicarPrecio();
    } else {
      this.precioVerde = 0;
      this.opcionPrecio = '';
    }
  }

  aplicarPrecio(): void {
    if (!this.lote) return;
    
    switch (this.opcionPrecio) {
      case 'costo': 
        this.precioVerde = this.lote.costo || 0; 
        break;
      case 'sugerido': 
        this.precioVerde = this.getPrecioSugerido(this.lote); 
        break;
      case 'p1': 
        this.precioVerde = this.lote.precio_1 || 0; 
        break;
      case 'e2': 
        this.precioVerde = this.lote.escala_2 || 0; 
        break;
      case 'e3': 
        this.precioVerde = this.lote.escala_3 || 0; 
        break;
      case 'manual':
        // No sobreescribimos el valor, dejamos que el usuario lo escriba en el input
        break;
    }
  }

  // =====================
  // CÁLCULOS (Fórmulas del Excel)
  // =====================

  get crt(): number {
    const factorMerma = 1 - (this.mermaPorcentaje / 100);
    if (factorMerma <= 0) return 0;
    return (this.precioVerde + this.gastosLogisticos) / factorMerma;
  }

  get met(): number {
    return (this.crt / 1000) * this.pesoGramos;
  }

  get cv(): number {
    return this.precioVenta * (this.comisionPorcentaje / 100);
  }

  get igvv(): number {
    return this.precioVenta * (this.igvPorcentaje / 100);
  }

  get cdp(): number {
    return this.met + this.costosEmpaque + this.cv + this.igvv;
  }

  get ganancia(): number {
    return this.precioVenta - this.cdp;
  }

  get gananciaVolumen(): number {
    return this.ganancia * this.cantidadVolumen;
  }

  get porcentajeGanancia(): number {
    const ventaSinIgv = this.precioVenta - this.igvv;
    if (ventaSinIgv <= 0) return 0;
    const costoSinIgv = this.cdp - this.igvv;
    return (1 - (costoSinIgv / ventaSinIgv)) * 100;
  }

  get ventaRecomendada(): number {
    const costoBase = this.met + this.costosEmpaque;
    const margenDeseado = costoBase * (this.gananciaMinimaRecomend / 100);
    const totalSinIgv = margenDeseado + costoBase + this.cv;
    const factorIgv = 1 + (this.igvPorcentaje / 100);
    return totalSinIgv * factorIgv;
  }
}