import { CommonModule, DatePipe, DecimalPipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Eye } from 'lucide-angular';
import { forkJoin } from 'rxjs';



import { UserNamePipe } from '../../../../../shared/pipes/user-name-pipe.pipe';
import { Envio } from '../../../../../shared/models/envio';
import { Lote } from '../../../../../shared/models/lote';
import { LoteTostado, LoteTostadoConInventario } from '../../../../../shared/models/lote-tostado';

import { LoteTostadoService } from '../../service/lote-tostado.service';
import { LoteService } from '../../../lotes-verdes/service/lote.service';
import { EnviosService } from '../../../../envios/service/envios.service';
import { HistorialService } from '../../../../../shared/services/historial.service';
import { Historial } from '../../../../../shared/models/historial';
import { ViewOrderComponent } from '../../../../orders/components/view-order/view-order.component';



@Component({
  selector: 'historic-lote-tostado',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    CommonModule,
    UserNamePipe,
    LucideAngularModule,
    ViewOrderComponent
  ],
  templateUrl: './historic-lote-tostado.component.html',
  styles: ``
})
export class HistoricLoteTostadoComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Eye = Eye;

  loteId = '';
  envios: Envio[] = [];
  historiales: Historial[] = [];

  showPedido = false;
  selectedPedidoId = '';
  registros: any[] = [];

  pesoTotalInventarios = 0;

  lote: Lote = {
    id_lote: '',
    peso: 0,
    variedades: [],
    proceso: '',
    tipo_lote: '',
    fecha_registro: new Date(),
    eliminado: false
  };

  LoteTostado: LoteTostadoConInventario = {
    id_lote_tostado: '',
    id_lote: '',
    fecha_tostado: new Date(),
    perfil_tostado: '',
    peso: 0,
    fecha_registro: new Date(),
    id_user: '',
    inventarioLotesTostados: [],
    lote: this.lote
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly location: Location,
    private readonly loteTostadoService: LoteTostadoService,
    private readonly enviosService: EnviosService,
    private readonly historialService: HistorialService
  ) { }

  ngOnInit(): void {
    this.loteId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.loteId) {
      console.error('No se recibió el id del lote tostado');
      return;
    }

    this.loadData();
  }

  loadData(): void {
    this.loteTostadoService.getLoteTostadoConInventario(this.loteId).subscribe({
      next: (loteTostado) => {
        this.LoteTostado = {
          ...loteTostado,
          inventarioLotesTostados: loteTostado.inventarioLotesTostados ?? [],
          lote: loteTostado.lote ?? this.lote
        };

        this.lote = this.LoteTostado.lote;
        this.calcularTotales();

        forkJoin({
          envios: this.enviosService.getEnviosByLote(loteTostado.id_lote_tostado),
          historiales: this.historialService.getByEntidad(loteTostado.id_lote_tostado)
        }).subscribe({
          next: ({ envios, historiales }) => {
            this.envios = envios ?? [];
            this.historiales = historiales ?? [];
            this.construirRegistros();
          },
          error: (err) => {
            console.error('Error al cargar actividad del lote:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar lote tostado:', err);
      }
    });
  }


  private construirRegistros(): void {
    const registrosEnvios = this.envios.map(e => ({
      tipo: 'ENVIO',
      accion: e.clasificacion || 'ENVÍO',
      comentario: e.comentario || 'Envío de café tostado',
      responsableTitulo: 'Cliente',
      responsableId: e.id_cliente,
      cantidad: e.cantidad,
      fecha: e.fecha,
      id_pedido: null
    }));

    const registrosHistorial = this.historiales.map(h => ({
      tipo: 'HISTORIAL',
      accion: h.accion,
      comentario: h.comentario || '—',
      responsableTitulo: 'Realizado por',
      responsableId: h.id_user,
      cantidad: null,
      fecha: h.fecha_registro,
      id_pedido: h.id_pedido || null
    }));

    this.registros = [...registrosEnvios, ...registrosHistorial]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  calcularTotales(): void {
    this.pesoTotalInventarios =
      this.LoteTostado.inventarioLotesTostados?.reduce(
        (total: number, inv: any) => total + Number(inv.cantidad_kg || 0),
        0
      ) ?? 0;
  }

  openPedido(r: any): void {
    if (!r.id_pedido) return;

    this.selectedPedidoId = r.id_pedido;
    this.showPedido = true;
  }

  goBack(): void {
    this.location.back();
  }
}