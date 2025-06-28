import { LoteTostado } from './../../../../shared/models/lote-tostado';
import { Component, EventEmitter, Input, OnInit, Output, output } from '@angular/core';
import { FichaTueste } from '../../../../shared/models/ficha-tueste';
import { LoteTostadoService } from '../../service/lote-tostado.service';

@Component({
  selector: 'ficha-tueste',
  imports: [],
  templateUrl: './ficha-tueste.component.html',
  styles: ``
})
export class FichaTuesteComponent implements OnInit {
  @Input() id :string = '';
  @Output() close = new EventEmitter<void>();

  
  data: FichaTueste = {
    id_lote: '',
    humedad: 0,
    densidad: 0,
    caramelizacion: 0,
    desarrollo: 0,
    temp_desarrollo: 0,
    agtrom: 0,
    tiempo: 0,
    tueste: '',
    id_lote_tostado: '',
    peso_total: 0,
  }

  constructor(
    readonly loteTostadoSvc: LoteTostadoService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.loteTostadoSvc.getFichaTueste(this.id).subscribe(data => {
      this.data = data;
    });
  }

  OnClose() {
    this.close.emit();
  }

}
