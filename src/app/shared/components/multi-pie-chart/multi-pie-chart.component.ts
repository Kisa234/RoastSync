import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as echarts from 'echarts';
import type { EChartsOption, SunburstSeriesOption } from 'echarts';
import { CoffeeFlavors, ICoffeeFlavor } from '../../models/rueda-sabores';
type ECharts = echarts.ECharts;

@Component({
  selector: 'multi-pie-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multi-pie-chart.component.html',
})
export class MultiPieChartComponent implements OnChanges, AfterViewInit {
  @Input() comentario!: string;
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  private chart!: echarts.ECharts;

  ngAfterViewInit(): void {
    this.chart = echarts.init(this.chartContainer.nativeElement);
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['comentario'] && this.chart) {
      this.updateChart();
    }
  }

  public getChartImage(): string {
    return this.chart.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff'
    });
  }

  private updateChart(): void {
    let notas: string[] = [];
    try {
      const data = JSON.parse(this.comentario) as { notas: string[] };
      notas = Array.isArray(data.notas) ? data.notas : [];
    } catch {
      console.warn('MultiPieChart: comentario no es JSON válido');
    }

    const sunburstData = this.filterFlavors(CoffeeFlavors, new Set(notas));

    const option: EChartsOption = {
      tooltip: { trigger: 'item', formatter: '{b}' },
      series: <SunburstSeriesOption>{
        type: 'sunburst',
        radius: [0, '90%'],
        data: sunburstData,
        label: { rotate: 'radial', color: '#333' },
        levels: [
          {},
          { r0: '0%', r: '25%', label: { rotate: 'tangential', fontSize: 16, color: '#fff' }, itemStyle: { borderWidth: 2, borderColor: '#fff' } },
          { r0: '25%', r: '60%', label: { rotate: 'tangential', fontSize: 14 }, itemStyle: { borderWidth: 1, borderColor: '#fff' } },
          { r0: '60%', r: '90%', label: { rotate: 'tangential', fontSize: 12 }, itemStyle: { borderWidth: 1, borderColor: '#fff' } }
        ]
      }
    };

    this.chart.setOption(option);
  }

  private filterFlavors(nodes: ICoffeeFlavor[], selected: Set<string>): any[] {
    return nodes.reduce<any[]>((acc, node) => {
      let children: any[] | undefined;
      if (node.children) {
        children = this.filterFlavors(node.children, selected);
      }
      if (selected.has(node.name) || (children && children.length)) {
        const item: any = { name: node.name, itemStyle: { color: node.color } };
        if (children && children.length) {
          item.children = children;
        } else {
          item.value = 1;
        }
        acc.push(item);
      }
      return acc;
    }, []);
  }
}