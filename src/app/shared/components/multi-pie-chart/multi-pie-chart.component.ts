import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as echarts from 'echarts';
import type { EChartsOption, SunburstSeriesOption } from 'echarts';
import { CoffeeFlavors, ICoffeeFlavor } from '../../models/rueda-sabores';

@Component({
  selector: 'multi-pie-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multi-pie-chart.component.html',
  styles: [':host { display: block; width: 100%; height: 400px; }']
})
export class MultiPieChartComponent implements OnChanges, AfterViewInit {
  @Input() comentario!: string;
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  private chart!: echarts.ECharts;
  private validFlavorNames = new Set<string>();

  constructor() {
    this.buildFlavorNameSet(CoffeeFlavors);
  }

  ngAfterViewInit(): void {
    const el = this.chartContainer.nativeElement as HTMLElement;
    // Ensure container has explicit size
    if (!el.style.height) {
      el.style.height = '100%';
    }
    this.chart = echarts.init(el);
    this.updateChart();
    // Handle window resize
    window.addEventListener('resize', () => this.chart.resize());
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

  updateChart(): void {
    // Parse and filter notas
    let notasRaw: any[] = [];
    try {
      const parsed = JSON.parse(this.comentario);
      if (Array.isArray(parsed.notas)) {
        notasRaw = parsed.notas;
      }
    } catch {
      console.warn('MultiPieChart: comentario no es JSON válido');
    }

    const selectedSet = new Set(
      notasRaw
        .map(n => String(n).trim().toLowerCase())
        .filter(n => this.validFlavorNames.has(n))
    );

    const sunburstData = this.filterFlavors(CoffeeFlavors, selectedSet);

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

    // Clear previous
    this.chart.clear();
    this.chart.setOption(option, { notMerge: true });
  }

  private buildFlavorNameSet(nodes: ICoffeeFlavor[]): void {
    for (const node of nodes) {
      this.validFlavorNames.add(node.name.toLowerCase());
      if (node.children) {
        this.buildFlavorNameSet(node.children);
      }
    }
  }

  private filterFlavors(nodes: ICoffeeFlavor[], selected: Set<string>): any[] {
    return nodes.reduce<any[]>((acc, node) => {
      const nameLower = node.name.toLowerCase();
      let children: any[] | undefined;
      if (node.children) {
        children = this.filterFlavors(node.children, selected);
      }
      if (selected.has(nameLower) || (children && children.length)) {
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
