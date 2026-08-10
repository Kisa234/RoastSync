import { CommonModule, DatePipe, DecimalPipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Eye, Truck } from 'lucide-angular';
import { forkJoin } from 'rxjs';

import { UserNamePipe } from '../../../../../shared/pipes/user-name-pipe.pipe';
import { Lote } from '../../../../../shared/models/lote';
import { LoteTostadoConInventario } from '../../../../../shared/models/lote-tostado';
import { Historial } from '../../../../../shared/models/historial';
import { Envio } from '../../../../../shared/models/envio';

import { LoteTostadoService } from '../../service/lote-tostado.service';
import { HistorialService } from '../../../../../shared/services/historial.service';
import { EnviosService } from '../../../../envios/service/envios.service';

@Component({
  selector: 'historic-lote-tostado',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    CommonModule,
    RouterLink,
    UserNamePipe,
    LucideAngularModule,
  ],
  templateUrl: './historic-lote-tostado.component.html',
})
export class HistoricLoteTostadoComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Eye = Eye;
  readonly Truck = Truck;

  loteId = '';
  historiales: Historial[] = [];
  envios: Envio[] = [];

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
    private readonly historialService: HistorialService,
    private readonly enviosSvc: EnviosService,
    private readonly router: Router,
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
          historiales: this.historialService.getByEntidad(loteTostado.id_lote_tostado),
          envios: this.enviosSvc.getEnviosPorEntidad('LOTE_TOSTADO', loteTostado.id_lote_tostado),
        }).subscribe({
          next: ({ historiales, envios }) => {
            this.historiales = historiales ?? [];
            this.envios = envios ?? [];
            this.construirRegistros();
          },
          error: (err) => console.error('Error al cargar actividad del lote:', err)
        });
      },
      error: (err) => console.error('Error al cargar lote tostado:', err)
    });
  }

  private construirRegistros(): void {
    const registrosHistorial = this.historiales.map(h => ({
      tipo: 'HISTORIAL',
      accion: h.accion,
      comentario: h.comentario || '—',
      responsableTitulo: 'Realizado por',
      responsableId: h.id_user,
      cantidad: null,
      fecha: h.fecha_registro,
      id_pedido: h.id_pedido || null,
      id_envio: null as string | null,
    }));

    const registrosEnvios = this.envios.map(e => ({
      tipo: 'ENVIO',
      accion: e.numero_correlativo,
      comentario: `Estado: ${e.estado}${e.medio_envio ? ' · ' + e.medio_envio : ''}`,
      responsableTitulo: 'Registrado por',
      responsableId: e.registrado_por_id,
      cantidad: null,
      fecha: e.fecha_registro,
      id_pedido: null as string | null,
      id_envio: e.id_envio,
    }));

    this.registros = [...registrosHistorial, ...registrosEnvios]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  calcularTotales(): void {
    this.pesoTotalInventarios =
      this.LoteTostado.inventarioLotesTostados?.reduce(
        (total: number, inv: any) => total + Number(inv.cantidad_kg || 0), 0
      ) ?? 0;
  }

  openPedido(r: any): void {
    if (!r.id_pedido) return;
    this.router.navigate(['/orders', r.id_pedido], {
      queryParams: { origen: `Lote Tostado ${this.loteId}` }
    });
  }

  openEnvio(r: any): void {
    if (!r.id_envio) return;
    this.router.navigate(['/envios', r.id_envio]);
  }

  goBack(): void {
    this.location.back();
  }
}