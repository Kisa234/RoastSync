import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, GitCompare } from 'lucide-angular';

import { UserNamePipe } from '../../../../../shared/pipes/user-name-pipe.pipe';
import { Pedido } from '../../../../../shared/models/pedido';
import { LoteVerdeConInventario } from '../../../../../shared/models/lote';
import { Historial } from '../../../../../shared/models/historial';

import { LoteService } from '../../service/lote.service';
import { PedidoService } from '../../../../orders/service/orders.service';
import { HistorialService } from '../../../../../shared/services/historial.service';
import { VerCambiosComponent } from "../../components/ver-cambios/ver-cambios.component";

type TipoFiltro = 'TODOS' | 'HISTORIAL' | 'PEDIDO';

interface RegistroVista {
  tipo: 'HISTORIAL' | 'PEDIDO';
  accion: string;
  comentario: string;
  usuario: string;
  fecha: string | Date;
  raw: Historial | Pedido;
}

@Component({
  selector: 'historic-lote',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    DecimalPipe,
    UserNamePipe,
    LucideAngularModule,
    VerCambiosComponent
  ],
  templateUrl: './historic-lote.component.html',
  styles: ``
})
export class HistoricLote implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly GitCompare = GitCompare;

  loteId = '';
  pedidos: Pedido[] = [];
  historial: Historial[] = [];

  registros: RegistroVista[] = [];
  filtroTipo: TipoFiltro = 'TODOS';

  page = 1;
  pageSize = 5;

  selectedHistorial?: Historial;
  showHistorial = false;

  lote: LoteVerdeConInventario = {
    id_lote: '',
    proveedor: '',
    productor: '',
    finca: '',
    distrito: '',
    departamento: '',
    peso: 0,
    variedades: [],
    proceso: '',
    tipo_lote: '',
    fecha_registro: new Date(),
    eliminado: false,
    clasificacion: '',
    costo: 0,
    altura: 0,
    id_user: '',
    id_analisis: '',
    peso_tostado: 0,
    inventarioLotes: []
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly location: Location,
    private readonly loteSvc: LoteService,
    private readonly pedidoSvc: PedidoService,
    private readonly historialService: HistorialService
  ) { }

  ngOnInit(): void {
    this.loteId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.loteId) {
      console.error('No se recibió el id del lote');
      return;
    }

    this.loadLote();
    this.loadPedidos();
    this.loadHistorial();
  }

  loadLote(): void {
    this.loteSvc.getLoteVerdeConInventarioById(this.loteId).subscribe({
      next: (lote) => {
        this.lote = {
          ...lote,
          inventarioLotes: lote.inventarioLotes ?? [],
          variedades: lote.variedades ?? []
        };
      },
      error: (err) => {
        console.error('Error al cargar lote con inventario:', err);
      }
    });
  }

  loadPedidos(): void {
    this.pedidoSvc.getPedidosByLote(this.loteId).subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos ?? [];
        this.buildRegistros();
      },
      error: (err) => {
        console.error('Error al cargar pedidos del lote:', err);
      }
    });
  }

  loadHistorial(): void {
    this.historialService.getByEntidad(this.loteId).subscribe({
      next: (historial) => {
        this.historial = historial ?? [];
        this.buildRegistros();
      },
      error: (err) => {
        console.error('Error al cargar historial del lote:', err);
      }
    });
  }

  private buildRegistros(): void {
    const historialMapeado: RegistroVista[] = (this.historial ?? []).map(h => ({
      tipo: 'HISTORIAL',
      accion: h.accion,
      comentario: h.comentario || 'N/A',
      usuario: h.id_user,
      fecha: h.fecha_registro,
      raw: h
    }));

    const pedidosMapeados: RegistroVista[] = (this.pedidos ?? []).map(p => ({
      tipo: 'PEDIDO',
      accion: p.tipo_pedido,
      comentario: this.getPedidoComentario(p),
      usuario: (p as any).id_user || '',
      fecha: (p as any).fecha_registro,
      raw: p
    }));

    this.registros = [...historialMapeado, ...pedidosMapeados]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    this.page = 1;
  }

  getPedidoComentario(p: Pedido): string {
    return `pedido de ${p.cantidad} gr`;
  }

  get registrosFiltrados(): RegistroVista[] {
    if (this.filtroTipo === 'TODOS') return this.registros;
    return this.registros.filter(r => r.tipo === this.filtroTipo);
  }

  get registrosPaginados(): RegistroVista[] {
    const start = (this.page - 1) * this.pageSize;
    return this.registrosFiltrados.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.registrosFiltrados.length / this.pageSize));
  }

  get pesoTotalInventarios(): number {
    return (this.lote.inventarioLotes || []).reduce(
      (total, inv) => total + (inv.cantidad_kg || 0),
      0
    );
  }

  getHistorialFromRegistro(r: RegistroVista): Historial | null {
    return r.tipo === 'HISTORIAL' ? (r.raw as Historial) : null;
  }

  isHistorialUpdate(r: RegistroVista): boolean {
    const historial = this.getHistorialFromRegistro(r);
    return !!historial && historial.accion === 'UPDATE';
  }

  openRegistroHistorial(r: RegistroVista): void {
    const historial = this.getHistorialFromRegistro(r);
    if (!historial) return;

    this.openHistorial(historial);
  }

  onFiltroChange(): void {
    this.page = 1;
  }

  prevPage(): void {
    if (this.page > 1) this.page--;
  }

  nextPage(): void {
    if (this.page < this.totalPages) this.page++;
  }

  openHistorial(h: Historial): void {
    this.selectedHistorial = h;
    this.showHistorial = true;
  }

  goBack(): void {
    this.location.back();
  }
}