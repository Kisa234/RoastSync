import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PedidoService } from '../../service/orders.service';
import { EstadisticasPedidos } from '../../../../shared/models/estadisticas-pedidos';
import { Pedido } from '../../../../shared/models/pedido';
import { FileSpreadsheet, LucideAngularModule } from 'lucide-angular';
import { UserNamePipe } from '../../../../shared/pipes/user-name-pipe.pipe';

@Component({
    selector: 'stadistic-pedidos',
    standalone: true,
    imports: [CommonModule, FormsModule, NgApexchartsModule, LucideAngularModule, UserNamePipe],
    templateUrl: './stadistic-pedidos.component.html',
})
export class StadisticPedidosComponent implements OnInit {

    readonly FileSpreadsheet = FileSpreadsheet;

    startDate = '';
    endDate = '';
    loading = false;

    stats: EstadisticasPedidos | null = null;
    pedidosRango: Pedido[] = [];

    // Gráfica barras — Total por tipo de pedido
    barSeries: any[] = [];
    barChart = {
        type: 'bar' as const,
        height: 300,
        toolbar: { show: false },
        fontFamily: 'inherit'
    };
    barColors = ['#B8672E'];
    barPlotOptions = { bar: { borderRadius: 4, columnWidth: '50%' } };
    barDataLabels = { enabled: false };
    barXAxis: any = { categories: [] as string[] };
    barYAxis = { title: { text: 'Pedidos' } };

    // Gráfica donut — Completados vs Pendientes
    pieChart = { type: 'donut' as const, height: 300, toolbar: { show: false } };
    pieSeries: number[] = [];
    pieLabels: string[] = ['Completados', 'Pendientes'];
    pieColors = ['#22C55E', '#EAB308'];
    pieLegend = { position: 'bottom' as const };

    constructor(
        private pedidoSvc: PedidoService,
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
        this.startDate = '2000-01-01'; // solo actúa como límite inferior de la query, no distorsiona el promedio
        this.endDate = this.toISO(new Date());
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

        if (!this.startDate || !this.endDate) return;
        this.loading = true;

        this.pedidoSvc.getEstadisticasPedidos(this.startDate, this.endDate).subscribe({
            next: (data) => {
                this.stats = data;
                this.updateCharts();
                this.loading = false;
            },
            error: () => this.loading = false
        });

        this.pedidoSvc.getPedidosByRango(this.startDate, this.endDate).subscribe(list => {
            // Excluir Orden Tueste (estadística propia) y Suscripcion (se rediseñará aparte)
            this.pedidosRango = list.filter(p =>
                p.tipo_pedido !== 'Orden Tueste' && p.tipo_pedido !== 'Suscripcion'
            );
        });
    }

    updateCharts(): void {
        if (!this.stats) return;

        this.barXAxis = { categories: this.stats.porTipo.map(t => t.tipo) };
        this.barSeries = [{
            name: 'Pedidos',
            data: this.stats.porTipo.map(t => t.total)
        }];

        this.pieSeries = [this.stats.pedidosCompletados, this.stats.pedidosPendientes];
    }

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

        const pedidosData = this.pedidosRango.map(p => ({
            'ID Pedido': p.id_pedido,
            'Tipo': p.tipo_pedido,
            'Fecha Registro': p.fecha_registro,
            'Cantidad': p.cantidad,
            'Estado': p.estado_pedido,
            'Facturado': p.facturado ? 'Sí' : 'No',
            'Fecha Completado': p.fecha_completado ?? '',
        }));

        const porTipoData = (this.stats?.porTipo ?? []).map(t => ({
            'Tipo': t.tipo,
            'Total': t.total,
            'Completados': t.completados,
            'Pendientes': t.pendientes,
            'Facturados': t.facturados,
            'No Facturados': t.noFacturados,
            'Cantidad Total': t.cantidadTotal,
            'Tiempo Prom. Completado (h)': t.tiempoPromedioCompletadoHoras?.toFixed(1) ?? '',
        }));

        const wsPedidos = utils.json_to_sheet(pedidosData);
        const wsPorTipo = utils.json_to_sheet(porTipoData);
        wsPedidos['!cols'] = fitToColumns(pedidosData);
        wsPorTipo['!cols'] = fitToColumns(porTipoData);

        const wb = utils.book_new();
        utils.book_append_sheet(wb, wsPedidos, 'Pedidos');
        utils.book_append_sheet(wb, wsPorTipo, 'Por Tipo');
        writeFileXLSX(wb, `estadisticas_pedidos_${this.startDate}_${this.endDate}.xlsx`);
    }

    // Paginación
    pagePedidos = 1;
    pageSizePedidos = 10;
    get totalPagesPedidos(): number { return Math.ceil(this.pedidosRango.length / this.pageSizePedidos) || 1; }
    get pagedPedidos() {
        const start = (this.pagePedidos - 1) * this.pageSizePedidos;
        return this.pedidosRango.slice(start, start + this.pageSizePedidos);
    }
}