import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Check, X } from 'lucide-angular';

import { BalonGasService } from '../../service/balon-gas.service';
import { RoastsService } from '../../service/roasts.service';
import { PedidoService } from '../../../orders/service/orders.service';
import { UiService } from '../../../../shared/services/ui.service';
import { Tueste } from '../../../../shared/models/tueste';
import { Pedido } from '../../../../shared/models/pedido';

type Modo = 'ACTUAL' | 'HISTORICO';
type PasoActual = 'PEDIDO' | 'BATCH';
type PasoHistorico = 'INICIO_PEDIDO' | 'INICIO_BATCH' | 'FIN_PEDIDO' | 'FIN_BATCH';

@Component({
  selector: 'add-balon-gas',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './add-balon-gas.component.html',
})
export class AddBalonGasComponent implements OnInit {
  @Output() close   = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  readonly X     = X;
  readonly Check = Check;

  modo: Modo = 'ACTUAL';
  saving   = false;
  errorMsg = '';
  precio   = 0;

  // ── ACTUAL ────────────────────────────────────────────────────
  pasoActual: PasoActual = 'PEDIDO';
  pedidosActuales: Pedido[]   = [];
  pedidoSelActual: Pedido | null = null;
  batchesActuales: Tueste[]   = [];
  batchSelActual: Tueste | null = null;
  loadingPedidos  = false;
  loadingBatches  = false;

  // ── HISTÓRICO ─────────────────────────────────────────────────
  pasoHistorico: PasoHistorico = 'INICIO_PEDIDO';

  // inicio
  fechaInicio        = '';
  pedidosInicio: Pedido[]   = [];
  pedidoSelInicio: Pedido | null = null;
  batchesInicio: Tueste[]   = [];
  batchSelInicio: Tueste | null = null;
  loadingPedidosInicio = false;
  loadingBatchesInicio = false;

  // fin
  fechaFin          = '';
  pedidosFin: Pedido[]     = [];
  pedidoSelFin: Pedido | null = null;
  batchesFin: Tueste[]     = [];
  batchSelFin: Tueste | null  = null;
  loadingPedidosFin  = false;
  loadingBatchesFin  = false;

  constructor(
    private balonGasSvc: BalonGasService,
    private roastsSvc:   RoastsService,
    private pedidoSvc:   PedidoService,
    private uiSvc:       UiService,
  ) {}

  ngOnInit(): void {
    this.cargarPedidosActuales();
  }

  // ── Tabs ──────────────────────────────────────────────────────

  setModo(m: Modo): void {
    this.modo     = m;
    this.errorMsg = '';
  }

  // ── ACTUAL: paso 1 — pedidos ──────────────────────────────────

  cargarPedidosActuales(): void {
    this.loadingPedidos = true;
    this.pedidoSvc.getPedidosOrdenTueste().subscribe({
      next: p  => { this.pedidosActuales = p ?? []; this.loadingPedidos = false; },
      error: () => { this.loadingPedidos = false; }
    });
  }

  selPedidoActual(p: Pedido): void {
    this.pedidoSelActual = p;
    this.batchSelActual  = null;
    this.batchesActuales = [];
    this.loadingBatches  = true;
    this.pasoActual      = 'BATCH';

    this.roastsSvc.getTuestesByPedido(p.id_pedido).subscribe({
      next: t  => { this.batchesActuales = t ?? []; this.loadingBatches = false; },
      error: () => { this.loadingBatches = false; }
    });
  }

  volverAPedidosActual(): void {
    this.pasoActual     = 'PEDIDO';
    this.batchSelActual = null;
  }

  // ── HISTÓRICO: inicio ─────────────────────────────────────────

  buscarPedidosInicio(): void {
    if (!this.fechaInicio) return;
    this.loadingPedidosInicio = true;
    this.pedidosInicio        = [];
    this.pedidoSelInicio      = null;
    this.batchesInicio        = [];
    this.batchSelInicio       = null;

    this.pedidoSvc.getPedidosOrdenTuesteByFecha(this.fechaInicio).subscribe({
      next: p  => { this.pedidosInicio = p ?? []; this.loadingPedidosInicio = false; this.pasoHistorico = 'INICIO_PEDIDO'; },
      error: () => { this.loadingPedidosInicio = false; }
    });
  }

  selPedidoInicio(p: Pedido): void {
    this.pedidoSelInicio      = p;
    this.batchSelInicio       = null;
    this.batchesInicio        = [];
    this.loadingBatchesInicio = true;
    this.pasoHistorico        = 'INICIO_BATCH';

    this.roastsSvc.getTuestesByPedido(p.id_pedido).subscribe({
      next: t  => { this.batchesInicio = t ?? []; this.loadingBatchesInicio = false; },
      error: () => { this.loadingBatchesInicio = false; }
    });
  }

  volverAPedidosInicio(): void {
    this.pasoHistorico  = 'INICIO_PEDIDO';
    this.batchSelInicio = null;
  }

  irAFin(): void {
    if (!this.batchSelInicio) { this.errorMsg = 'Selecciona el batch de inicio'; return; }
    this.errorMsg      = '';
    this.pasoHistorico = 'FIN_PEDIDO';
  }

  // ── HISTÓRICO: fin ────────────────────────────────────────────

  buscarPedidosFin(): void {
    if (!this.fechaFin) return;
    this.loadingPedidosFin = true;
    this.pedidosFin        = [];
    this.pedidoSelFin      = null;
    this.batchesFin        = [];
    this.batchSelFin       = null;

    this.pedidoSvc.getPedidosOrdenTuesteByFecha(this.fechaFin).subscribe({
      next: p  => { this.pedidosFin = p ?? []; this.loadingPedidosFin = false; this.pasoHistorico = 'FIN_PEDIDO'; },
      error: () => { this.loadingPedidosFin = false; }
    });
  }

  selPedidoFin(p: Pedido): void {
    this.pedidoSelFin      = p;
    this.batchSelFin       = null;
    this.batchesFin        = [];
    this.loadingBatchesFin = true;
    this.pasoHistorico     = 'FIN_BATCH';

    this.roastsSvc.getTuestesByPedido(p.id_pedido).subscribe({
      next: t  => { this.batchesFin = t ?? []; this.loadingBatchesFin = false; },
      error: () => { this.loadingBatchesFin = false; }
    });
  }

  volverAPedidosFin(): void {
    this.pasoHistorico = 'FIN_PEDIDO';
    this.batchSelFin   = null;
  }

  volverAInicio(): void {
    this.pasoHistorico = 'INICIO_BATCH';
    this.errorMsg      = '';
  }

  // ── Guards ────────────────────────────────────────────────────

  canSaveActual():    boolean { return this.precio > 0 && !!this.batchSelActual; }
  canSaveHistorico(): boolean { return this.precio > 0 && !!this.batchSelInicio && !!this.batchSelFin; }

  // ── Guardar ───────────────────────────────────────────────────

  onCancel(): void { if (!this.saving) this.close.emit(); }

  save(): void {
    if (this.saving) return;
    this.errorMsg = '';

    if (this.precio <= 0) { this.errorMsg = 'Ingresa un precio válido'; return; }

    if (this.modo === 'ACTUAL') {
      if (!this.batchSelActual) { this.errorMsg = 'Selecciona un batch'; return; }
      this.saving = true;

      this.balonGasSvc.create({ precio: this.precio }).subscribe({
        next: balon => {
          this.balonGasSvc.start({
            id_balon_gas:     balon.id_balon_gas,
            id_tueste_inicio: this.batchSelActual!.id_tueste,
          }).subscribe({
            next:  () => { this.saving = false; this.created.emit(); },
            error: err => { this.saving = false; this.errorMsg = err?.error?.error ?? 'Error al iniciar el balón'; }
          });
        },
        error: err => { this.saving = false; this.errorMsg = err?.error?.error ?? 'Error al crear el balón'; }
      });

    } else {
      if (!this.batchSelInicio || !this.batchSelFin) {
        this.errorMsg = 'Selecciona los batches de inicio y fin'; return;
      }
      this.saving = true;

      this.balonGasSvc.createHistorico({
        precio:           this.precio,
        id_tueste_inicio: this.batchSelInicio.id_tueste,
        id_tueste_fin:    this.batchSelFin.id_tueste,
      }).subscribe({
        next:  () => { this.saving = false; this.created.emit(); },
        error: err => { this.saving = false; this.errorMsg = err?.error?.error ?? 'Error al registrar el balón histórico'; }
      });
    }
  }
}