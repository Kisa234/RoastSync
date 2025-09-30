import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as echarts from 'echarts';
import { Observable, Subject, takeUntil } from 'rxjs';
import { DashboardService } from '../../service/dashboard.service';

@Component({
  selector: 'clasificacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clasificacion.component.html',
})
export class ClasificacionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private chart!: echarts.ECharts;
  private destroy$ = new Subject<void>();
  private resizeHandler = () => this.chart?.resize();

  loading = false;
  error: string | null = null;

  constructor(private dashboardService: DashboardService) { }

  ngAfterViewInit(): void {
    this.chart = echarts.init(this.chartContainer.nativeElement);
    window.addEventListener('resize', this.resizeHandler);
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', this.resizeHandler);
    this.chart?.dispose();
  }

  private loadData(): void {
    this.loading = true;
    this.error = null;

    this.dashboardService.getStockLotesPorClasificacion()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Record<string, number>) => {
          this.loading = false;
          this.renderChart(data);
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          this.error = 'Error al cargar los datos de clasificaciones';
        }
      });
  }

  private renderChart(data: Record<string, number>): void {
    if (!this.chart) return;

    const seriesData = Object.keys(data).map(key => ({
      name: key,
      value: data[key]
    }));

    const numberFormatter = (value: number) => value.toLocaleString('en-US'); // agrega comas

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => `${params.name}: ${numberFormatter(params.value)} kg (${params.percent}%)`
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'outside',
            formatter: (params: any) => `${params.name}: ${numberFormatter(params.value)} kg`
          },
          labelLine: { show: true },
          data: seriesData
        }
      ]
    };

    this.chart.clear();
    this.chart.setOption(option, { notMerge: true });
  }

}
