import { CommonModule, DatePipe, DecimalPipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';

import { UserNamePipe } from '../../../../../shared/pipes/user-name-pipe.pipe';
import { Envio } from '../../../../../shared/models/envio';
import { Lote } from '../../../../../shared/models/lote';
import { LoteTostado } from '../../../../../shared/models/lote-tostado';

import { LoteTostadoService } from '../../service/lote-tostado.service';
import { LoteService } from '../../../lotes-verdes/service/lote.service';
import { EnviosService } from '../../../../envios/service/envios.service';

@Component({
  selector: 'historic-lote-tostado',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    CommonModule,
    UserNamePipe,
    LucideAngularModule
  ],
  templateUrl: './historic-lote-tostado.component.html',
  styles: ``
})
export class HistoricLoteTostadoComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;

  loteId: string = '';
  envios: Envio[] = [];

  lote: Lote = {
    id_lote: '',
    peso: 0,
    variedades: [],
    proceso: '',
    tipo_lote: '',
    fecha_registro: new Date(),
    eliminado: false
  };

  LoteTostado: LoteTostado = {
    id_lote_tostado: '',
    id_lote: '',
    fecha_tostado: new Date(),
    perfil_tostado: '',
    peso: 0,
    fecha_registro: new Date(),
    id_user: ''
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly location: Location,
    private readonly loteTostadoService: LoteTostadoService,
    private readonly loteService: LoteService,
    private readonly enviosService: EnviosService
  ) {}

  ngOnInit(): void {
    this.loteId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.loteId) {
      console.error('No se recibió el id del lote tostado');
      return;
    }

    this.loadData();
  }

  loadData(): void {
    this.loteTostadoService.getById(this.loteId).subscribe({
      next: (loteTostado) => {
        this.LoteTostado = loteTostado;

        this.loteService.getById(loteTostado.id_lote).subscribe({
          next: (lote) => {
            this.lote = lote;

            this.enviosService.getEnviosByLote(loteTostado.id_lote_tostado).subscribe({
              next: (envios) => {
                this.envios = envios ?? [];
              },
              error: (err) => {
                console.error('Error al cargar envíos:', err);
              }
            });
          },
          error: (err) => {
            console.error('Error al cargar lote verde relacionado:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar lote tostado:', err);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}
