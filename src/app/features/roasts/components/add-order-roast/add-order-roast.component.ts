import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { X, Check } from 'lucide-angular';

import { PedidoService } from '../../../orders/service/orders.service';
import { LoteService } from '../../../inventory/service/lote.service';
import { UserService } from '../../../users/service/users-service.service';
import { Pedido } from '../../../../shared/models/pedido';
import { UiService } from '../../../../shared/services/ui.service';
import { AnalisisService } from '../../../analysis/service/analisis.service';
import { AvgTueste } from '../../../../shared/models/avg-tueste';
import { RoastsService } from '../../service/roasts.service';


interface Batch {
  id: number;
  pesoVerde: number;
  pesoTostado: number;
}

@Component({
  selector: 'add-roaster',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './add-order-roast.component.html',
})
export class AddRoasterComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<any>();

  readonly X = X;
  readonly Check = Check;

  // Listas para selects
  clientes: any[] = [];
  lotes: any[] = [];
  lotesAll: any[] = [];

  // Modelo principal
  orden: Partial<Pedido> = {
    tipo_pedido: 'Orden Tueste',
    cantidad: 0,
    comentario: '',
    id_user: '',
    id_lote: '',
    pesos: [],
    tostadora: '',
    fecha_tueste: new Date(),
  };

  

  Tostadoras: string[] = [
    'Kaleido',
    'Candela',
  ];

  // Disponibles
  pesoVerdeDisp = 0;
  pesoTostadoDisp = 0;

  // Para batches
  batches: Batch[] = [];
  batchVerde = 0;
  batchTostado = 0;

  nextId = 1;


  tiposTueste = [
    'Tueste Claro',
    'Tueste Medio Claro',
    'Tueste Medio',
    'Tueste Medio Oscuro',
    'Tueste Oscuro'
  ];

  constructor(
    private pedidoSvc: PedidoService,
    private loteSvc: LoteService,
    private userSvc: UserService,
    private roastSvc: RoastsService,
    private uiSvc: UiService,
    private analisisSvc: AnalisisService
  ) { }

  ngOnInit() {
    this.userSvc.getUsers().subscribe(u => this.clientes = u);
    this.loteSvc.getAll().subscribe(l => {
      this.lotesAll = l;
      this.lotes = [];
    });

    
  }

  onClienteChange() {
    if (this.orden.id_user) {
      this.lotes = this.lotesAll.filter(l => l.id_user === this.orden.id_user);
      this.orden.id_lote = '';
    }
    this.pesoVerdeDisp = 0;
    this.pesoTostadoDisp = 0;
  }



  cerrar() {
    this.close.emit();
  }


  onLoteChange() {
    const sel = this.lotes.find(l => l.id_lote === this.orden.id_lote);
    this.pesoVerdeDisp = sel?.peso || 0;
    this.pesoTostadoDisp = sel?.peso_tostado || 0;
  }



  agregarBatch() {
    const nextId = this.batches.length + 1;
    this.batches.push({
      id: nextId,
      pesoVerde: 0,
      pesoTostado: 0
    });
  }



  // cada vez que cambie el verde, recalculas tostado
  onBatchVerdeChange(b: Batch) {
    b.pesoTostado = parseFloat((b.pesoVerde / 1.15).toFixed(2));
  }

  // cada vez que cambie el tostado, recalculas verde
  onBatchTostadoChange(b: Batch) {
    b.pesoVerde = parseFloat((b.pesoTostado * 1.15).toFixed(2));
  }

  BatchVerde() {
    this.batchTostado = parseFloat((this.orden.cantidad! / 1.15).toFixed(2));
  }

 
  BatchTostado() {
    this.orden.cantidad = parseFloat((this.batchTostado * 1.15).toFixed(2));
  }



  quitarBatch(b: Batch) {
    this.pesoVerdeDisp += b.pesoVerde;
    this.pesoTostadoDisp += b.pesoTostado;
    this.batches = this.batches.filter(x => x.id !== b.id);
  }

  get totalVerde(): number {
    return this.batches.reduce((sum, b) => sum + b.pesoVerde, 0);
  }
  get totalTostado(): number {
    return this.batches.reduce((sum, b) => sum + b.pesoTostado, 0);
  }

  guardar() {
    console.log('Guardar orden de tueste', this.orden);
    // validar que exista al menos un batch
    if (!this.batches.length) return;
    this.orden.pesos = this.batches.map(b => b.pesoVerde);
    // construir payload
    const payload = { ...this.orden };
    this.pedidoSvc.createPedido(payload).subscribe(res => {
      this.create.emit(res);
      this.close.emit();
    });
  }
}
