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
  styles: [':host { display: block; width: 100%; height: 400px; overflow: visible; }']
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
    // pixelRatio 1.5: nítido y liviano (report-lote/muestra lo recomprime a JPEG)
    return this.chart.getDataURL({
      type: 'png',
      pixelRatio: 1.5,
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

    const rootData = this.filterFlavors(this.flavorTree, selectedSet);

    // Si hay 2 o más categorías raíz seleccionadas, las envolvemos en un
    // nodo invisible extra. Esto empuja las categorías (chocolate, frutal,
    // dulce, etc.) un anillo hacia afuera, dejando el centro en blanco
    // en vez de que sus textos se encimen ahí.
    const necesitaAnilloBlanco = rootData.length >= 2;
    const sunburstData = necesitaAnilloBlanco
      ? [{
          name: '',
          itemStyle: { color: 'transparent', borderWidth: 0 },
          label: { show: false },
          children: rootData
        }]
      : rootData;

    // Pocas notas en el anillo exterior → texto tangencial (sigue el arco,
    // se lee derecho). Muchas notas → radial (cabe en segmentos angostos).
    const hojas = this.countLeaves(rootData);
    const rotacionExterior: 'tangential' | 'radial' = hojas <= 6 ? 'tangential' : 'radial';

    const nivelesCategorias: any[] = necesitaAnilloBlanco
      ? [
          // Anillo 0: blanco/invisible, sin label, solo para dar espacio.
          {
            r0: '0%', r: '14%',
            label: { show: false },
            itemStyle: { color: 'transparent', borderWidth: 0 }
          },
          {
            r0: '14%', r: '48%',
            label: {
              rotate: 'radial',
              fontSize: 11,
              color: '#fff',
              fontWeight: 600,
              minAngle: 12,
              formatter: (p: any) => this.splitLabel(p.name)
            },
            itemStyle: { borderWidth: 2, borderColor: '#fff' }
          },
          {
            r0: '48%', r: '72%',
            label: { rotate: 'tangential', fontSize: 12, color: '#fff', minAngle: 10 },
            itemStyle: { borderWidth: 1.5, borderColor: '#fff' }
          },
          this.outerRingLevel('72%', '90%', rotacionExterior)
        ]
      : [
          {
            r0: '0%', r: '35%',
            label: {
              rotate: 'radial',
              fontSize: 11,
              color: '#fff',
              fontWeight: 600,
              minAngle: 12,
              formatter: (p: any) => this.splitLabel(p.name)
            },
            itemStyle: { borderWidth: 2, borderColor: '#fff' }
          },
          {
            r0: '35%', r: '68%',
            label: { rotate: 'tangential', fontSize: 12, color: '#fff', minAngle: 10 },
            itemStyle: { borderWidth: 1.5, borderColor: '#fff' }
          },
          this.outerRingLevel('68%', '90%', rotacionExterior)
        ];

    const option: EChartsOption = {
      tooltip: { trigger: 'item', formatter: '{b}' },
      series: <SunburstSeriesOption>{
        type: 'sunburst',
        radius: [0, '90%'],
        data: sunburstData,
        // minAngle: si un segmento queda más angosto que esto (en grados),
        // ECharts oculta su etiqueta en vez de encimarla con la vecina.
        label: { rotate: 'radial', color: '#fff', fontSize: 11, fontWeight: 500, minAngle: 8 },
        itemStyle: {
          borderWidth: 1.5,
          borderColor: '#fff'
        },
        levels: [{}, ...nivelesCategorias]
      }
    };

    this.chart.clear();
    this.chart.setOption(option, { notMerge: true });
  }

  // Anillo exterior (notas individuales: "caramelo", "manzana"...).
  // Antes la etiqueta iba AFUERA del arco con una línea; quedaba chica y al
  // costado (en el PDF casi no se leía). Ahora va dentro del arco, en blanco
  // como los demás anillos.
  private outerRingLevel(r0: string, r: string, rotate: 'tangential' | 'radial'): any {
    return {
      r0,
      r,
      label: {
        position: 'inside',
        rotate,
        fontSize: 11,
        fontWeight: 600,
        color: '#fff',
        minAngle: 4,
        overflow: 'truncate',
      },
      labelLine: { show: false },
      itemStyle: { borderWidth: 1.5, borderColor: '#fff' }
    };
  }

  private countLeaves(nodes: any[]): number {
    return nodes.reduce(
      (n, node) => n + (node.children?.length ? this.countLeaves(node.children) : 1),
      0
    );
  }

  // Parte etiquetas largas tipo "Nueces/Cacao" en dos líneas por el "/",
  // igual que "NUTTY/COCOA" en la rueda oficial SCA.
  private splitLabel(name: string): string {
    if (!name) return '';
    if (name.includes('/')) {
      return name.split('/').join('/\n');
    }
    return name;
  }

  private filterFlavors(nodes: FlavorNode[], selected: Set<string>): any[] {
    return nodes.reduce<any[]>((acc, node) => {
      let children: any[] | undefined;
      if (node.children && node.children.length) {
        children = this.filterFlavors(node.children, selected);
      }
      const isSelected = selected.has(node.name.toLowerCase());
      if (isSelected || (children && children.length)) {
        // Color tal como viene del backend (Nota.color), sin override de marca.
        const item: any = { name: node.name, itemStyle: { color: node.color } };
        if (children && children.length) item.children = children;
        else item.value = 1;
        acc.push(item);
      }
      return acc;
    }, []);
  }
}