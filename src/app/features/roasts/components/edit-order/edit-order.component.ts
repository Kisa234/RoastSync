import { RoastsService } from './../../service/roasts.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoteService } from '../../../inventory/service/lote.service';
import { PedidoService } from '../../../orders/service/orders.service';
import { UserService } from '../../../users/service/users-service.service';
import { UiService } from '../../../../shared/services/ui.service';
import { AnalisisService } from '../../../analysis/service/analisis.service';
import { X, Check } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { Pedido } from '../../../../shared/models/pedido';
import { forkJoin } from 'rxjs';



interface Batch {
  id: number;
  pesoVerde: number;
  pesoTostado: number;
}

@Component({
  selector: 'edit-order',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './edit-order.component.html',
  styles: ``
})
export class EditOrderComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<any>();
  @Input() OrderId: string = "";

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
    private uiSvc: UiService,
    private analisisSvc: AnalisisService,
    private roastsService: RoastsService
  ) { }

  ngOnInit() {

    forkJoin({
      users: this.userSvc.getUsers(),
      lotesMaestros: this.loteSvc.getAll(),
      order: this.pedidoSvc.getPedidoById(this.OrderId)
    }).subscribe(({ users, lotesMaestros, order }) => {
      this.clientes = users;
      this.lotesAll = lotesMaestros;
      this.orden = { ...order };

      // 2) Filtra lotes según cliente de la orden
      this.lotes = this.lotesAll.filter(l => l.id_user === this.orden.id_user);

      // 3) Valida análisis y calcula stocks disponibles
      this.onLoteChange();



      // 2c) Traer los “tostes” guardados en la orden y mapearlos a batches
      this.roastsService.getTuestesByPedido(this.OrderId).subscribe(tuestes => {
        this.batches = tuestes.map((t, i) => ({
          id: i + 1,
          pesoVerde: t.peso_entrada,
          pesoTostado: parseFloat((t.peso_entrada * 1.15).toFixed(2))
        }));

        // 2d) Recalcular pesos disponibles restando lo ya asignado
        const sel = this.lotesAll.find(l => l.id_lote === this.orden.id_lote);
        if (sel) {
          const usadosV = this.batches.reduce((s, b) => s + b.pesoVerde, 0);
          const usadosT = this.batches.reduce((s, b) => s + b.pesoTostado, 0);
          this.pesoVerdeDisp = sel.peso - usadosV;
          this.pesoTostadoDisp = sel.peso_tostado - usadosT;
        }
      });
    });

    this.BatchVerde();
    this.BatchTostado();
    this.onLoteChange();
  }

  onSelectLote(idLote: string) {
    this.orden.id_lote = idLote;
    this.onLoteChange();      // valida análisis y recalcula stocks
  }

  // Para manejar la fecha:
  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const fechaStr = input.value;      // "YYYY-MM-DD"
    this.orden.fecha_tueste = fechaStr
      ? new Date(fechaStr)
      : undefined;
  }

  private formatDate(fecha: string | Date): string {
    const d = new Date(fecha);
    return d.toISOString().substring(0, 10);
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

    if (!sel) return;

    this.loteSvc.getById(sel.id_lote).subscribe(lote => {
      // Supongamos que viene lote.analisis
      if (!lote.id_analisis) {
        this.uiSvc.alert(
          'error',
          'Lote sin análisis',
          `El lote ${lote.id_lote} no tiene análisis registrado. Por favor, crea uno antes de continuar.`,
          5000
        );
        this.orden.id_lote = '';
        this.pesoVerdeDisp = 0;
        this.pesoTostadoDisp = 0;
      }
    });
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
    b.pesoTostado = parseFloat((b.pesoVerde * 1.15).toFixed(2));
  }

  // cada vez que cambie el tostado, recalculas verde
  onBatchTostadoChange(b: Batch) {
    b.pesoVerde = parseFloat((b.pesoTostado / 1.15).toFixed(2));
  }

  BatchVerde() {
    this.batchTostado = parseFloat((this.orden.cantidad! * 1.15).toFixed(2));
  }

  // cada vez que cambie el tostado, recalculas verde
  BatchTostado() {
    this.orden.cantidad = parseFloat((this.batchTostado / 1.15).toFixed(2));
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
    console.log('Payload a enviar:', payload);
    this.pedidoSvc.updatePedido(this.OrderId, payload).subscribe(res => {
      this.create.emit(res);
      this.close.emit();
    });
  }
}
