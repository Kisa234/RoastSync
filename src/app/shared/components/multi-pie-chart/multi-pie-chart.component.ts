import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as echarts from 'echarts';
import type { EChartsOption, SunburstSeriesOption } from 'echarts';
import { NotasService } from '../../services/notas.service';
import { Nota } from '../../models/notas';
import { Subject, takeUntil } from 'rxjs';

interface FlavorNode {
  id?: string;
  name: string;
  color: string;
  children?: FlavorNode[];
}

@Component({
  selector: 'multi-pie-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multi-pie-chart.component.html',
  styles: [':host { display: block; width: 100%; height: 400px; }']
})
export class MultiPieChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() comentario!: string;
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private chart!: echarts.ECharts;
  private destroy$ = new Subject<void>();
  private resizeHandler = () => this.chart?.resize();

  // Árbol de sabores proveniente del backend
  private flavorTree: FlavorNode[] = [];
  // Set para validar los nombres de notas seleccionadas
  private validFlavorNames = new Set<string>();
  // Estado de carga
  loading = false;
  error: string | null = null;

  constructor(private notasService: NotasService) {}

  ngAfterViewInit(): void {
    const el = this.chartContainer.nativeElement as HTMLElement;
    if (!el.style.height) el.style.height = '100%';
    this.chart = echarts.init(el);

    // Cargar notas desde API
    this.fetchNotasAndRender();

    // Resize handler
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['comentario'] && this.chart) {
      // Si cambiaron las notas seleccionadas, re-render con el árbol ya cargado
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', this.resizeHandler);
    if (this.chart) {
      this.chart.dispose();
    }
  }

  public getChartImage(): string {
    return this.chart.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff'
    });
  }

  // --- Carga de datos ---

  private fetchNotasAndRender(): void {
    this.loading = true;
    this.error = null;

    this.notasService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notas) => {
          this.flavorTree = this.buildTree(notas);
          this.validFlavorNames = this.buildNameSet(this.flavorTree);
          this.loading = false;
          this.updateChart();
        },
        error: (err) => {
          console.error('Error cargando notas:', err);
          this.error = 'No se pudieron cargar las notas.';
          this.loading = false;
          // Aún así limpiamos chart para mostrar vacío
          this.updateChart();
        }
      });
  }

  private buildTree(notas: Nota[]): FlavorNode[] {
    // Map por id para construir jerarquía
    const byId = new Map<string, FlavorNode>();
    const roots: FlavorNode[] = [];

    // Inicializar nodos
    for (const n of notas) {
      byId.set(n.id, { id: n.id, name: n.name, color: n.color, children: [] });
    }

    // Enlazar por parentId
    for (const n of notas) {
      const node = byId.get(n.id)!;
      const parentId = n.parentId ?? null;
      if (parentId && byId.has(parentId)) {
        byId.get(parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    }

    // Ordenar alfabéticamente por nivel
    const sortRecursive = (nodes: FlavorNode[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
      for (const c of nodes) {
        if (c.children && c.children.length) sortRecursive(c.children);
      }
    };
    sortRecursive(roots);

    return roots;
  }

  private buildNameSet(tree: FlavorNode[]): Set<string> {
    const set = new Set<string>();
    const walk = (nodes: FlavorNode[]) => {
      for (const n of nodes) {
        set.add(n.name.toLowerCase());
        if (n.children && n.children.length) walk(n.children);
      }
    };
    walk(tree);
    return set;
  }

  // --- Render ---

  private updateChart(): void {
    if (!this.chart) return;

    // Parsear comentario → notas seleccionadas (por nombre)
    let notasRaw: any[] = [];
    try {
      const parsed = JSON.parse(this.comentario ?? '{}');
      if (Array.isArray(parsed?.notas)) {
        notasRaw = parsed.notas;
      }
    } catch {
      // noop
    }

    const selectedSet = new Set(
      notasRaw
        .map(n => String(n).trim().toLowerCase())
        .filter(n => this.validFlavorNames.has(n))
    );

    const sunburstData = this.filterFlavors(this.flavorTree, selectedSet);

    const option: EChartsOption = {
      tooltip: { trigger: 'item', formatter: '{b}' },
      series: <SunburstSeriesOption>{
        type: 'sunburst',
        radius: [0, '90%'],
        data: sunburstData,
        label: { rotate: 'radial', color: '#333' },
        levels: [
          {},
          {
            r0: '0%', r: '25%',
            label: { rotate: 'tangential', fontSize: 16, color: '#fff' },
            itemStyle: { borderWidth: 2, borderColor: '#fff' }
          },
          {
            r0: '25%', r: '60%',
            label: { rotate: 'tangential', fontSize: 14 },
            itemStyle: { borderWidth: 1, borderColor: '#fff' }
          },
          {
            r0: '60%', r: '90%',
            label: { rotate: 'tangential', fontSize: 12, color: '#fff' },
            itemStyle: { borderWidth: 1, borderColor: '#fff' }
          }
        ]
      }
    };

    this.chart.clear();
    this.chart.setOption(option, { notMerge: true });
  }

  private filterFlavors(nodes: FlavorNode[], selected: Set<string>): any[] {
    return nodes.reduce<any[]>((acc, node) => {
      let children: any[] | undefined;
      if (node.children && node.children.length) {
        children = this.filterFlavors(node.children, selected);
      }
      const isSelected = selected.has(node.name.toLowerCase());
      if (isSelected || (children && children.length)) {
        const item: any = { name: node.name, itemStyle: { color: node.color } };
        if (children && children.length) item.children = children;
        else item.value = 1;
        acc.push(item);
      }
      return acc;
    }, []);
  }
}
