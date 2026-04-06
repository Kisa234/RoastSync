import { Almacen } from './../../../../shared/models/almacen';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { X, Check } from 'lucide-angular';

import { PedidoService } from '../../../orders/service/orders.service';
import { LoteService } from '../../../inventory/lotes-verdes/service/lote.service';
import { UserService } from '../../../users/service/users-service.service';
import { Pedido } from '../../../../shared/models/pedido';
import { UiService } from '../../../../shared/services/ui.service';
import { AnalisisService } from '../../../analysis/service/analisis.service';
import { AvgTueste } from '../../../../shared/models/avg-tueste';
import { RoastsService } from '../../service/roasts.service';
import { LoteVerdeConInventario } from '../../../../shared/models/lote';
import { AlmacenService } from '../../../inventory/almacenes/service/almacen.service';


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
  lotes: LoteVerdeConInventario[] = [];
  lotesAll: LoteVerdeConInventario[] = [];
  Almacenes: Almacen[] = [];

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
    'Tueste Medio',
    'Tueste Oscuro'
  ];

  constructor(
    private pedidoSvc: PedidoService,
    private loteSvc: LoteService,
    private userSvc: UserService,
    private roastSvc: RoastsService,
    private uiSvc: UiService,
    private analisisSvc: AnalisisService,
    private almacenSvc: AlmacenService
  ) { }

  ngOnInit() {
    this.userSvc.getUsers().subscribe(usuarios => {
      this.loteSvc.getLotesVerdesConInventario().subscribe(lotes => {
        this.lotesAll = lotes;
        this.clientes = usuarios.filter(u =>
          lotes.some(l => l.id_user === u.id_user)
        );
        this.almacenSvc.getAlmacenesActivos().subscribe(almacenes => {
          this.Almacenes = almacenes;
        });
      });
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
    this.pesoVerdeDisp = sel?.inventarioLotes.reduce((total, inv) => total + (inv.cantidad_kg || 0), 0) || 0;
    this.pesoTostadoDisp = sel?.inventarioLotes.reduce((total, inv) => total + (inv.cantidad_tostado_kg || 0), 0) || 0;
    this.Almacenes = sel?.inventarioLotes?.map(inv => inv.id_almacen).flatMap(id => this.Almacenes.filter(a => a.id_almacen === id)) || [];
  }




  agregarBatch() {
    const nextId = this.batches.length + 1;
    this.batches.push({
      id: nextId,
      pesoVerde: 0,
      pesoTostado: 0
    });
  }



  private calcTostado(verde: number): number {
    return parseFloat((verde * 0.85).toFixed(2));
  }
  private calcVerde(tostado: number): number {
    return parseFloat((tostado / 0.85).toFixed(2));
  }

  // cada vez que cambie el verde, recalculas tostado
  onBatchVerdeChange(b: Batch) {
    b.pesoTostado = parseFloat((b.pesoVerde * 0.85).toFixed(2));
  }

  // cada vez que cambie el tostado, recalculas verde
  onBatchTostadoChange(b: Batch) {
    b.pesoVerde = parseFloat((b.pesoTostado * 1.15).toFixed(2));
  }

  BatchVerde() {
    this.batchTostado = parseFloat((this.orden.cantidad! * 0.85).toFixed(2));
  }

  // cada vez que cambie el tostado, recalculas verde
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

  validarPesos(): boolean {
    if (this.totalVerde !== this.orden.cantidad) {
      this.uiSvc.alert('warning', 'error',
        'El peso verde total de los batches debe ser igual a la cantidad de la orden.', 5000);
      return false;
    }
    return true;
  }

  validarFormulario(): boolean {
    if (!this.orden.id_user) {
      this.uiSvc.alert('warning', 'Campo requerido', 'Debes seleccionar un cliente.', 4000);
      return false;
    }

    if (!this.orden.id_lote) {
      this.uiSvc.alert('warning', 'Campo requerido', 'Debes seleccionar un lote.', 4000);
      return false;
    }

    if (!this.orden.id_almacen) {
      this.uiSvc.alert('warning', 'Campo requerido', 'Debes seleccionar un almacén.', 4000);
      return false;
    }

    if (!this.orden.fecha_tueste) {
      this.uiSvc.alert('warning', 'Campo requerido', 'Debes seleccionar la fecha de tueste.', 4000);
      return false;
    }

    if (!this.orden.comentario || !String(this.orden.comentario).trim()) {
      this.uiSvc.alert('warning', 'Campo requerido', 'Debes seleccionar el tipo de tueste.', 4000);
      return false;
    }

    if (!this.orden.tostadora || !String(this.orden.tostadora).trim()) {
      this.uiSvc.alert('warning', 'Campo requerido', 'Debes seleccionar la tostadora.', 4000);
      return false;
    }

    if (this.orden.facturado === undefined || this.orden.facturado === null) {
      this.uiSvc.alert('warning', 'Campo requerido', 'Debes indicar si es facturado o no.', 4000);
      return false;
    }

    if (!this.orden.cantidad || this.orden.cantidad <= 0) {
      this.uiSvc.alert('warning', 'Campo requerido', 'Debes ingresar una cantidad válida para el batch verde.', 4000);
      return false;
    }

    if (!this.batchTostado || this.batchTostado <= 0) {
      this.uiSvc.alert('warning', 'Campo requerido', 'Debes ingresar una cantidad válida para el batch tostado.', 4000);
      return false;
    }

    if (!this.batches.length) {
      this.uiSvc.alert('warning', 'Campo requerido', 'Debes agregar al menos un batch.', 4000);
      return false;
    }

    const batchInvalido = this.batches.some(
      b => !b.pesoVerde || b.pesoVerde <= 0 || !b.pesoTostado || b.pesoTostado <= 0
    );

    if (batchInvalido) {
      this.uiSvc.alert('warning', 'Batches incompletos', 'Todos los batches deben tener pesos válidos.', 4000);
      return false;
    }

    if (this.totalVerde > this.pesoVerdeDisp) {
      this.uiSvc.alert('warning', 'Stock insuficiente', 'El peso verde total de los batches supera el verde disponible.', 5000);
      return false;
    }

    if (!this.validarPesos()) {
      return false;
    }

    return true;
  }

  guardar() {

    if (!this.validarFormulario()) return;

    this.orden.pesos = this.batches.map(b => b.pesoVerde);

    const payload = { ...this.orden };

    this.pedidoSvc.createPedido(payload).subscribe({
      next: (res) => {
        this.uiSvc.alert('success', 'Orden creada', 'La orden de tueste fue creada correctamente.', 3000);
        this.create.emit(res);
        this.close.emit();
      },
      error: (err) => {
        console.error(err);
        this.uiSvc.alert('error', 'Error', 'No se pudo guardar la orden de tueste.', 5000);
      }
    });
  }
}
