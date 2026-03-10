import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';
import { UserNamePipe } from '../../../../../shared/pipes/user-name-pipe.pipe';
import { Pedido } from '../../../../../shared/models/pedido';
import { LoteVerdeConInventario } from '../../../../../shared/models/lote';
import { LoteService } from '../../service/lote.service';
import { PedidoService } from '../../../../orders/service/orders.service';
import { HistorialService } from '../../../../../shared/services/historial.service';
import { Historial } from '../../../../../shared/models/historial';

@Component({
  selector: 'historic-lote',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    CommonModule,
    UserNamePipe,
    LucideAngularModule
  ],
  templateUrl: './historic-lote.component.html',
  styles: ``
})
export class HistoricLoteComponent implements OnInit {
  readonly X = X;

  @Output() close = new EventEmitter<void>();
  @Input() loteId: string = '';

  pedidos: Pedido[] = [];
  historial: Historial[] = [];

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
    private readonly loteSvc: LoteService,
    private readonly pedidoSvc: PedidoService,
    private readonly historialService: HistorialService
  ) {}

  ngOnInit(): void {
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
      },
      error: (err) => {
        console.error('Error al cargar historial del lote:', err);
      }
    });
  }

  get pesoTotalInventarios(): number {
    return (this.lote.inventarioLotes || []).reduce(
      (total, inv) => total + (inv.cantidad_kg || 0),
      0
    );
  }

  onCancel(): void {
    this.close.emit();
  }
}