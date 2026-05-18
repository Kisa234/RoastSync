import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PedidoService } from '../../../orders/service/orders.service';
import { EstadisticasTueste } from '../../../../shared/models/estadisticas-tueste';

import { RoastsService } from '../../service/roasts.service';
import { Tueste } from '../../../../shared/models/tueste';
import { Pedido } from '../../../../shared/models/pedido';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FileSpreadsheet, LucideAngularModule } from 'lucide-angular';
import { UserNamePipe } from "../../../../shared/pipes/user-name-pipe.pipe";
import { MinSecPipe } from "../../../../shared/pipes/time.pipe";


@Component({
  selector: 'stadistic-roast',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule, LucideAngularModule, UserNamePipe, MinSecPipe],
  templateUrl: './stadistic.component.html',
})
export class StadisticRoastComponent implements OnInit {

  readonly FileSpreadsheet = FileSpreadsheet;

  startDate = '';
  endDate = '';
  loading = false;

  stats: EstadisticasTueste | null = null;


  pedidosRango: Pedido[] = [];
  tuestesRango: Tueste[] = [];
  tablaVista: 'pedidos' | 'tuestes' = 'pedidos';

  // Gráfica barras — Fortunato vs Terceros
  barSeries: any[] = [];
  barChart = {
    type: 'bar' as const,
    height: 300,
    toolbar: { show: false },
    fontFamily: 'inherit'
  };
  barColors = ['#B8672E', '#D4956A'];
  barPlotOptions = { bar: { borderRadius: 4, columnWidth: '50%' } };
  barDataLabels = { enabled: false };
  barXAxis: any = { categories: ['Fortunato', 'Terceros'] };
  barYAxis = { title: { text: 'Batches' } };

  // Gráfica donut — Candela vs Total
  pieChart = { type: 'donut' as const, height: 300, toolbar: { show: false } };
  pieSeries: number[] = [];
  pieLabels: string[] = ['Candela', 'Otras tostadoras'];
  pieColors = ['#B8672E', '#D4956A'];
  pieLegend = { position: 'bottom' as const };

  constructor(
    private pedidoSvc: PedidoService,
    private roastsSvc: RoastsService
  ) { }

  ngOnInit(): void {
    this.resetRange();
  }

  private toISO(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  resetRange(): void {
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - 1);
    this.startDate = this.toISO(start);
    this.endDate = this.toISO(end);
    this.loadData();
  }

  resetHistoric(): void {
    this.startDate = '';
    this.endDate = '';
    this.loadData();
  }

  onFilterChange(): void {
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      this.endDate = this.startDate;
    }
    this.loadData();
  }

  loadData(): void {
    this.pagePedidos = 1;
    this.pageTuestes = 1;
    
    if (!this.startDate || !this.endDate) return;
    this.loading = true;

    this.pedidoSvc.getEstadisticasTueste(this.startDate, this.endDate).subscribe({
      next: (data) => {
        this.stats = data;
        this.updateCharts();
        this.loading = false;
      },
      error: () => this.loading = false
    });

    this.pedidoSvc.getPedidosByRango(this.startDate, this.endDate).subscribe(list => {
      this.pedidosRango = list.filter(p => p.tipo_pedido === 'Orden Tueste');
    });

    this.roastsSvc.getTuestesByRango(this.startDate, this.endDate).subscribe(list => {
      this.tuestesRango = list;
    });
  }

  updateCharts(): void {
    if (!this.stats) return;

    // Barras — Fortunato vs Terceros
    this.barSeries = [{
      name: 'Batches',
      data: [this.stats.batchFortunato, this.stats.batchTerceros]
    }];

    // Donut — Candela vs Otras
    const totalBatch = this.stats.batchTostadosCandela +
      (this.stats.batchFortunato + this.stats.batchTerceros - this.stats.batchTostadosCandela);
    this.pieSeries = [
      this.stats.batchTostadosCandela,
      Math.max(0, (this.stats.batchFortunato + this.stats.batchTerceros) - this.stats.batchTostadosCandela)
    ];
  }

  // exportar datos a Excel
  async exportar(): Promise<void> {
    const XLSX = await import('xlsx');
    const { utils, writeFileXLSX } = XLSX;

    const fitToColumns = (rows: any[]) => {
      if (!rows.length) return [];
      const headers = Object.keys(rows[0]);
      return headers.map(h => ({
        wch: Math.max(h.length, ...rows.map(r => (r[h] ?? '').toString().length)) + 2
      }));
    };

    // ---- Hoja 1: Pedidos ----
    const pedidosData = this.pedidosRango.map(p => ({
      'ID Pedido': p.id_pedido,
      'Lote': p.id_lote,
      'Fecha Tueste': p.fecha_tueste,
      'Cantidad (gr)': p.cantidad,
      'Tostadora': p.tostadora,
      'Pesos por Batch': p.pesos?.join(' | ') ?? '',
      'Estado': p.estado_pedido,
      'Tipo Tueste': p.comentario,
      'Facturado': p.facturado ? 'Sí' : 'No',
      'Fecha Registro': p.fecha_registro,
      'Fecha Completado': p.fecha_completado ?? '',
    }));

    // ---- Hoja 2: Tuestes ----
    const tuestesData = this.tuestesRango.map(t => ({
      'ID Tueste': t.id_tueste,
      'Lote': t.id_lote,
      'ID Pedido': t.id_pedido,
      'Fecha Tueste': t.fecha_tueste,
      'Tostadora': t.tostadora,
      'Batch': t.num_batch,
      'Peso Entrada (gr)': t.peso_entrada,
      'Densidad': t.densidad,
      'Humedad': t.humedad,
      'Temp. Entrada': t.temperatura_entrada,
      'Llama Inicial': t.llama_inicial,
      'Aire Inicial': t.aire_inicial,
      'Pto. No Retorno': t.punto_no_retorno,
      'Tiempo Después Crack': t.tiempo_despues_crack,
      'Temp. Crack': t.temperatura_crack,
      'Temp. Salida': t.temperatura_salida,
      'Tiempo Total': t.tiempo_total,
      '% Caramelización': t.porcentaje_caramelizacion,
      'Desarrollo': t.desarrollo,
      'Grados Desarrollo': t.grados_desarrollo,
      'Peso Salida (gr)': t.peso_salida,
      'Merma (%)': t.merma,
      'Agtrom Comercial': t.agtrom_comercial,
      'Agtrom Gourmet': t.agtrom_gourmet,
      'Estado': t.estado_tueste,
    }));

    const wsPedidos = utils.json_to_sheet(pedidosData);
    const wsTuestes = utils.json_to_sheet(tuestesData);

    wsPedidos['!cols'] = fitToColumns(pedidosData);
    wsTuestes['!cols'] = fitToColumns(tuestesData);

    const wb = utils.book_new();
    utils.book_append_sheet(wb, wsPedidos, 'Pedidos Tueste');
    utils.book_append_sheet(wb, wsTuestes, 'Tuestes');

    writeFileXLSX(wb, `estadisticas_tueste_${this.startDate}_${this.endDate}.xlsx`);
  }

  // Paginación pedidos
  pagePedidos = 1;
  pageSizePedidos = 10;
  get totalPagesPedidos(): number {
    return Math.ceil(this.pedidosRango.length / this.pageSizePedidos) || 1;
  }
  get pagedPedidos() {
    const start = (this.pagePedidos - 1) * this.pageSizePedidos;
    return this.pedidosRango.slice(start, start + this.pageSizePedidos);
  }

  // Paginación tuestes
  pageTuestes = 1;
  pageSizeTuestes = 10;
  get totalPagesTuestes(): number {
    return Math.ceil(this.tuestesRango.length / this.pageSizeTuestes) || 1;
  }
  get pagedTuestes() {
    const start = (this.pageTuestes - 1) * this.pageSizeTuestes;
    return this.tuestesRango.slice(start, start + this.pageSizeTuestes);
  }

}