import { Component } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, History, Sheet } from 'lucide-angular';
import { Router } from '@angular/router';

import { BolsaConInventario } from '../../../../../shared/models/bolsa';
import { BolsaService } from '../../service/bolsa.service';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-bolsa-main',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    LucideAngularModule,
  ],
  templateUrl: './bolsa-main.component.html',
  styles: []
})
export class BolsaMainComponent {

  readonly Search = Search;
  readonly History = History;
  readonly Sheet = Sheet;

  bolsas: BolsaConInventario[] = [];
  private _bolsasFiltradas: BolsaConInventario[] = [];

  filterText = '';

  constructor(
    private bolsaService: BolsaService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadBolsas();
  }

  loadBolsas() {
    this.bolsaService.getConInventario().subscribe(bolsas => {
      this.bolsas = bolsas ?? [];
      this.aplicarFiltro();
    });
  }

  aplicarFiltro() {
    const term = this.filterText.trim().toLowerCase();

    this._bolsasFiltradas = this.bolsas.filter(b => {
      if (!term) return true;
      return (
        b.id_bolsa?.toLowerCase().includes(term) ||
        b.id_lote_tostado?.toLowerCase().includes(term) ||
        b.id_pedido?.toLowerCase().includes(term) ||
        b.molienda?.toLowerCase().includes(term) ||
        b.comentario?.toLowerCase().includes(term)
      );
    });
  }

  getBolsasFiltradas(): BolsaConInventario[] {
    return this._bolsasFiltradas;
  }

  onSearchChange() {
    this.aplicarFiltro();
  }

  openHistoric(b: BolsaConInventario) {
    this.router.navigate(['/inventory/bolsa/historico', b.id_bolsa]);
  }

  exportBolsas() {
    const data = this.getBolsasFiltradas().map(b => {
      const almacenes = (b.inventarios || [])
        .map(inv => `${inv.almacen?.nombre || 'N/A'}: ${inv.cantidad} unid.`)
        .join(' | ');

      return {
        'ID Bolsa': b.id_bolsa,
        'Lote Tostado': b.id_lote_tostado,
        'Pedido': b.id_pedido,
        'Gramaje (gr)': b.gramaje,
        'Molienda': b.molienda,
        'Cantidad Total': b.cantidad,
        'Almacén': almacenes || 'Sin almacén',
        'Comentario': b.comentario || '',
        'Fecha Embolsado': b.fecha_embolsado
          ? new Date(b.fecha_embolsado).toLocaleDateString('es-PE')
          : '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bolsas');

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, `bolsas_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
}