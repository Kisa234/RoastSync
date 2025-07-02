import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexStroke,
  ApexMarkers,
  ApexGrid,
  ApexYAxis,
  ApexLegend
} from 'ng-apexcharts';
import { AnalisisSensorial } from '../../../../shared/models/analisis-sensorial';

export type RadarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  fill: ApexFill;
  stroke: ApexStroke;
  markers: ApexMarkers;
  grid: ApexGrid;
  yaxis: ApexYAxis;
  legend: ApexLegend;
};

@Component({
  selector: 'spider-graph',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  templateUrl: './spider-graph.component.html',
  styles: [`:host { display: block; }`]
})
export class SpiderGraphComponent implements OnChanges {
  @Input() aS: AnalisisSensorial | null = null;

  public chartOptions: RadarChartOptions = {
    series: [
      {
        name: 'Puntaje Sensorial',
        data: [6, 6, 6, 6, 6, 6, 6, 6, 6]
      }
    ],
    chart: {
      type: 'radar',
      height: 350,
      toolbar: { show: false },
      animations: { enabled: true }
    },
    labels: [
      'Fragancia/Aroma',
      'Sabor',
      'Sabor Residual',
      'Acidez',
      'Cuerpo',
      'Uniformidad',
      'Balance',
      'Taza Limpia',
      'Dulzor'
    ],
    stroke: {
      show: true,
      width: 2
    },
    fill: {
      opacity: 0.2
    },
    markers: {
      size: 4
    },
    yaxis: {
      show: false,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
      min: 6,
      max: 10,
      tickAmount: 8,
      decimalsInFloat: 1
    },
    grid: {
      show: false
    },
    legend: {
      show: false
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['aS'] && this.aS) {
      this.chartOptions.series = [
        {
          name: 'Puntaje Sensorial',
          data: [
            this.aS.fragancia_aroma,
            this.aS.sabor,
            this.aS.sabor_residual,
            this.aS.acidez,
            this.aS.cuerpo,
            this.aS.uniformidad,
            this.aS.balance,
            this.aS.taza_limpia,
            this.aS.dulzor
          ]
        }
      ];
    }
  }
}
