import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';

import { UserNamePipe } from '../../../../../shared/pipes/user-name-pipe.pipe';
import { Pedido } from '../../../../../shared/models/pedido';
import { LoteVerdeConInventario } from '../../../../../shared/models/lote';
import { Historial } from '../../../../../shared/models/historial';

import { LoteService } from '../../service/lote.service';
import { PedidoService } from '../../../../orders/service/orders.service';
import { HistorialService } from '../../../../../shared/services/historial.service';

@Component({
  selector: 'historic-lote',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    UserNamePipe,
    LucideAngularModule
  ],
  templateUrl: './historic-lote.component.html',
  styles: ``
})
export class HistoricLote implements OnInit {
  readonly ArrowLeft = ArrowLeft;

  loteId: string = '';
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
    private readonly route: ActivatedRoute,
    private readonly location: Location,
    private readonly loteSvc: LoteService,
    private readonly pedidoSvc: PedidoService,
    private readonly historialService: HistorialService
  ) {}

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

  goBack(): void {
    this.location.back();
  }
}
