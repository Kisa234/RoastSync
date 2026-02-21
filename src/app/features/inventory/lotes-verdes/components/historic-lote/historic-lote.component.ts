import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';
import { UserNamePipe } from '../../../../../shared/pipes/user-name-pipe.pipe';
import { Pedido } from '../../../../../shared/models/pedido';
import { Lote } from '../../../../../shared/models/lote';
import { LoteService } from '../../service/lote.service';
import { PedidoService } from '../../../../orders/service/orders.service';
import { HistorialService } from '../../../../../shared/services/historial.service';


@Component({
  selector: 'historic-lote',
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

  pedidos: Pedido[] = []
  lote: Lote ={
    id_lote: '',
    peso: 0,
    variedades: [],
    proceso: '',
    tipo_lote: '',
    fecha_registro: new Date(),
    eliminado: false
  }

  constructor(
    private readonly loteSvc:LoteService,
    private readonly pedidoSvc:PedidoService,
    private readonly historialService: HistorialService
  ){}

  ngOnInit(): void {
    this.loteSvc.getById(this.loteId).subscribe(lote=>{
      this.lote = lote;
      this.pedidoSvc.getPedidosByLote(this.loteId).subscribe(pedidos =>{
        this.pedidos = pedidos;
      })    
    })
  }

  onCancel() {
    this.close.emit();
  }
  
}
