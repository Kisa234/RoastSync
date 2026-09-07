import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
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
  ApexLegend,
  ApexPlotOptions,
  ApexXAxis
} from 'ng-apexcharts';
import { AnalisisSensorial } from '../../models/analisis-sensorial';

export type RadarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  fill: ApexFill;
  stroke: ApexStroke;
  markers: ApexMarkers;
  grid: ApexGrid;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
};

@Component({
  selector: 'spider-graph',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  templateUrl: './spider-graph.component.html',
  // overflow: visible evita que las etiquetas largas ("Sabor Residual") se corten
  // contra el borde del contenedor padre.
  styles: [':host { display: block; overflow: visible; }']
})
export class SpiderGraphComponent implements OnChanges {
  @Input() aS: AnalisisSensorial | null = null;
  @ViewChild('chart') chart!: ChartComponent;

  public chartOptions: RadarChartOptions = {
    series: [{ name: 'Puntaje Sensorial', data: [] }],
    chart: {
      type: 'radar',
      height: 300,
      // deja aire alrededor para que las etiquetas no se corten con el borde
      parentHeightOffset: 0,
      toolbar: { show: false },
      animations: { enabled: true }
    },
    // ApexCharts trunca las etiquetas del radar según el espacio angular
    // disponible por categoría, sin importar el tamaño del contenedor.
    // "Sabor Residual" es la más larga de las 6 y siempre se recortaba,
    // así que se acorta acá en vez de agrandar el chart indefinidamente.
    labels: [
      'Fragancia/Aroma',
      'Sabor',
      'Sabor Resid.',
      'Acidez',
      'Cuerpo',
      'Balance'
    ],
    xaxis: {
      labels: {
        style: {
          fontSize: '10px',
          colors: ['#8A5A2B', '#8A5A2B', '#8A5A2B', '#8A5A2B', '#8A5A2B', '#8A5A2B']
        }
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['#3B82F6']
    },
    fill: {
      opacity: 0.25,
      colors: ['#3B82F6']
    },
    markers: {
      size: 4,
      colors: ['#3B82F6'],
      strokeColors: '#fff',
      strokeWidth: 1
    },
    yaxis: {
      show: false,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
      min: 1,
      max: 10,
      tickAmount: 8,
      decimalsInFloat: 1
    },
    // ⚠️ IMPORTANTE: en radar charts esto NO dibuja los anillos.
    // grid: true acá pinta líneas horizontales rectas de fondo (el bug que viste).
    // Los anillos hexagonales van en plotOptions.radar.polygons (abajo).
    grid: {
      show: false
    },
    legend: {
      show: false
    },
    plotOptions: {
      radar: {
        polygons: {
          strokeColors: '#E5E5E5',
          connectorColors: '#E5E5E5',
          fill: {
            colors: ['#ffffff', '#F9F9F9']
          }
        }
      }
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['aS'] && this.aS) {
      const nuevosDatos = [
        this.aS.fragancia_aroma,
        this.aS.sabor,
        this.aS.sabor_residual,
        this.aS.acidez,
        this.aS.cuerpo,
        this.aS.balance
      ];

      this.chartOptions = {
        ...this.chartOptions,
        series: [{ name: 'Puntaje Sensorial', data: nuevosDatos }]
      };
    }
  }

  // Exporta el radar como PNG usando el método nativo de ApexCharts
  // (chart.dataURI()), en vez de html2canvas — html2canvas suele fallar
  // en silencio al capturar el SVG de ApexCharts y por eso el spider
  // no aparecía en el PDF.
  public async getChartImage(): Promise<string> {
    // dataURI() está tipado como { imgURI } | { blob } porque puede devolver
    // cualquiera de las dos según las opciones que se le pasen — sin
    // opciones siempre devuelve { imgURI }, así que lo afirmamos con el cast.
    const result = await this.chart.dataURI() as { imgURI: string };
    return result.imgURI;
  }
}