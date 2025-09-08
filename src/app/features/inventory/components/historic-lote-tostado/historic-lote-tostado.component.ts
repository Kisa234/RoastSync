import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserNamePipe } from '../../../../shared/pipes/user-name-pipe.pipe';
import { LucideAngularModule, X } from 'lucide-angular';
import { Envio } from '../../../../shared/models/envio';
import { LoteTostado } from '../../../../shared/models/lote-tostado';
import { LoteTostadoService } from '../../service/lote-tostado.service';
import { EnviosService } from '../../../envios/service/envios.service';
import { Lote } from '../../../../shared/models/lote';
import { LoteService } from '../../service/lote.service';

@Component({
  selector: 'historic-lote-tostado',
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
export class HistoricLoteTostadoComponent {
  readonly X = X;

  @Output() close = new EventEmitter<void>();
  @Input() loteId: string = '';

  envios: Envio[] = []
  lote: Lote = {
    id_lote: '',
    peso: 0,
    variedades: [],
    proceso: '',
    tipo_lote: '',
    fecha_registro: new Date(),
    eliminado: false
  }
  LoteTostado: LoteTostado = {
    id_lote_tostado: '',
    id_lote: '',
    fecha_tostado: new Date(),
    perfil_tostado: '',
    peso: 0,
    fecha_registro: new Date(),
    id_user: ''
  }

  constructor(
    private readonly loteTostadoService: LoteTostadoService,
    private readonly LoteService: LoteService,
    private readonly enviosService: EnviosService
  ) { }

  ngOnInit(): void {
    this.loteTostadoService.getById(this.loteId).subscribe(loteTostado => {
      this.LoteTostado = loteTostado;
      this.LoteService.getById(loteTostado.id_lote).subscribe(lote => {
        this.lote = lote;
        this.enviosService.getEnviosByLote(loteTostado.id_lote_tostado).subscribe(envios => {
          this.envios = envios;
        });
      });
    });

  }

  onCancel() {
    this.close.emit();
  }
}
