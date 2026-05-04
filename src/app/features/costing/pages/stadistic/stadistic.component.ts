import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PedidoConLote } from '../../../../shared/models/pedido';
import { PedidoService } from '../../../orders/service/orders.service';
import { ApexChart } from 'ng-apexcharts';


interface ClasifStats {
  clasificacion: string;
  totalPedidos: number;
  kilosTotales: number;
  promedioPorPedido: number;
  lotes: Set<string>;
  promedioPorLote: number;
}

@Component({
  selector: 'app-stadistic',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './stadistic.component.html',
})
export class StadisticComponent implements OnInit {

  startDate = '';
  endDate = '';

  pedidos: PedidoConLote[] = [];
  stats: ClasifStats[] = [];

  // Barras - kilos por clasificación
  barSeries: any[] = [];
  barCategories: string[] = [];
  barChart = {
    type: 'bar' as const,
    height: 300,
    toolbar: { show: false },
    fontFamily: 'inherit'
  };
  barColors = ['#B8672E'];
  barPlotOptions = {
    bar: { borderRadius: 4, columnWidth: '50%' }
  };
  barDataLabels = { enabled: false };
  barXAxis: any = { categories: [] };
  barYAxis = { title: { text: 'Kilos (kg)' } };



  pieChart: ApexChart = {
    type: 'donut',
    height: 300,
    toolbar: { show: false }
  };
  // Torta - distribución pedidos
  pieSeries: number[] = [];
  pieLabels: string[] = [];

  pieColors = ['#B8672E', '#D4956A', '#8B4513', '#DEB887', '#A0522D'];
  pieLegend = { position: 'bottom' as const };

  constructor(private pedidoSvc: PedidoService) { }

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
    start.setMonth(end.getMonth() - 3);
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
    this.pedidoSvc.getPedidosConLote().subscribe(pedidos => {
      this.pedidos = pedidos.filter(p => {
        // solo venta verde y tostado verde completados
        if (!['Venta Verde', 'Tostado Verde'].includes(p.tipo_pedido)) return false;
        if (p.estado_pedido !== 'Completado') return false;

        // filtro de fechas
        if (this.startDate || this.endDate) {
          const fecha = new Date(p.fecha_registro);
          if (this.startDate && fecha < new Date(this.startDate)) return false;
          if (this.endDate && fecha > new Date(this.endDate + 'T23:59:59')) return false;
        }

        return true;
      });

      this.calcularStats();
    });
  }

  calcularStats(): void {
    const map = new Map<string, ClasifStats>();

    for (const p of this.pedidos) {
      const clasificacion = p.lote?.clasificacion ?? 'Sin clasificación';
      const key = clasificacion.toLowerCase();

      if (!map.has(key)) {
        map.set(key, {
          clasificacion: clasificacion,
          totalPedidos: 0,
          kilosTotales: 0,
          promedioPorPedido: 0,
          lotes: new Set(),
          promedioPorLote: 0,
        });
      }

      const s = map.get(key)!;
      s.totalPedidos++;
      s.kilosTotales += Number(p.cantidad || 0);
      if (p.id_lote) s.lotes.add(p.id_lote);
    }

    // calcular promedios
    map.forEach(s => {
      s.promedioPorPedido = s.totalPedidos > 0 ? s.kilosTotales / s.totalPedidos : 0;
      s.promedioPorLote = s.lotes.size > 0 ? s.kilosTotales / s.lotes.size : 0;
    });

    // ordenar por kilos desc
    this.stats = Array.from(map.values()).sort((a, b) => b.kilosTotales - a.kilosTotales);

    this.updateCharts();
  }

  updateCharts(): void {
    const labels = this.stats.map(s => s.clasificacion);
    const kilos = this.stats.map(s => Math.round(s.kilosTotales * 100) / 100);
    const pedidos = this.stats.map(s => s.totalPedidos);

    // barras
    this.barCategories = labels;
    this.barSeries = [{ name: 'Kilos vendidos', data: kilos }];
    this.barXAxis = { categories: labels };

    // torta
    this.pieLabels = labels;
    this.pieSeries = pedidos;
  }

  get totalKilos(): number {
    return this.stats.reduce((t, s) => t + s.kilosTotales, 0);
  }

  get totalPedidos(): number {
    return this.stats.reduce((t, s) => t + s.totalPedidos, 0);
  }
}