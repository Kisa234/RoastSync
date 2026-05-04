import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Check } from 'lucide-angular';

import { UserService } from '../../../users/service/users-service.service';
import { AlmacenService } from '../../../inventory/almacenes/service/almacen.service';
import { LoteTostadoService } from '../../../inventory/lotes-tostados/service/lote-tostado.service';

import { User } from '../../../../shared/models/user';
import { Almacen } from '../../../../shared/models/almacen';
import { CreateEnvio } from '../../../../shared/models/envio';
import { LoteTostado, LoteTostadoConInventario } from '../../../../shared/models/lote-tostado';
import { EnviosService } from '../../service/envios.service';
import { SelectSearchComponent } from '../../../../shared/components/select-search/select-search.component';

@Component({
  selector: 'add-envio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    SelectSearchComponent,
  ],
  templateUrl: './add-envio.component.html',
})
export class AddEnvioComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();

  readonly X = X;
  readonly Check = Check;

  saving = false;

  model: CreateEnvio = {
    id_cliente: '',
    id_lote_tostado: '',
    id_almacen: '',
    cantidad: 0,
    comentario: '',
    origen: 'LOTE_TOSTADO'
  };

  clientes: User[] = [];
  private readonly FORTUNATO_ID = '25eba595-1556-4a90-a3c7-27edc759a127';

  lotes: LoteTostadoConInventario[] = [];
  lotesCliente: LoteTostadoConInventario[] = [];

  almacenes: Almacen[] = [];
  almacenesFiltrados: Almacen[] = [];

  selectedLote?: LoteTostadoConInventario;
  availableQty = 0;

  constructor(
    private enviosService: EnviosService,
    private userService: UserService,
    private loteTostadoService: LoteTostadoService,
    private almacenService: AlmacenService,

  ) { }

  ngOnInit(): void {
    this.userService.getUsers().subscribe(users => {
      this.clientes = users.filter(u =>
        u.rol === 'cliente' || u.id_user === this.FORTUNATO_ID
      );
    });
    this.loteTostadoService.getLotesTostadosConInventario().subscribe(lotes => {
      this.lotes = lotes;
    });

    this.almacenService.getAlmacenesActivos().subscribe(almacenes => {
      this.almacenes = almacenes;
    });
  }

  onClienteChange(idCliente: string): void {
    this.model.id_cliente = idCliente;
    this.model.id_lote_tostado = '';
    this.model.id_almacen = '';
    this.model.cantidad = 0;

    this.selectedLote = undefined;
    this.availableQty = 0;
    this.almacenesFiltrados = [];

    const esFortuanto = idCliente === this.FORTUNATO_ID;

    this.lotesCliente = this.lotes.filter(lote => {
      if (lote.eliminado) return false;
      if (esFortuanto) return lote.id_user !== idCliente;
      return lote.id_user === idCliente;
    });
  }

  onLoteChange(idLoteTostado: string): void {
    this.model.id_lote_tostado = idLoteTostado;
    this.model.id_almacen = '';
    this.model.cantidad = 0;
    this.availableQty = 0;

    this.selectedLote = this.lotesCliente.find(
      lote => lote.id_lote_tostado === idLoteTostado
    );

    if (!this.selectedLote) {
      this.almacenesFiltrados = [];
      return;
    }

    const idsAlmacenesConStock = [
      ...new Set(
        (this.selectedLote.inventarioLotesTostados || [])
          .filter(inv => Number(inv.cantidad_kg || 0) > 0)
          .map(inv => inv.almacen?.id_almacen)
          .filter((id): id is string => !!id)
      )
    ];

    this.almacenesFiltrados = this.almacenes.filter(a =>
      idsAlmacenesConStock.includes(a.id_almacen)
    );
  }

  onAlmacenChange(): void {
    if (!this.selectedLote || !this.model.id_almacen) {
      this.availableQty = 0;
      return;
    }

    const inventario = this.selectedLote.inventarioLotesTostados?.find(
      inv => inv.almacen?.id_almacen === this.model.id_almacen
    );

    this.availableQty = Number(inventario?.cantidad_kg || 0);
    this.validarCantidad();
  }

  validarCantidad(): void {
    const cantidad = Number(this.model.cantidad || 0);

    if (cantidad < 0) {
      this.model.cantidad = 0;
      return;
    }

    if (cantidad > this.availableQty) {
      this.model.cantidad = this.availableQty;
    }
  }

  canSave(): boolean {
    return !!this.model.id_cliente
      && !!this.model.id_lote_tostado
      && !!this.model.id_almacen
      && Number(this.model.cantidad) > 0
      && Number(this.model.cantidad) <= this.availableQty;
  }

  save(): void {
    if (!this.canSave() || this.saving) return;

    this.saving = true;

    this.enviosService.createEnvio(this.model).subscribe({
      next: () => {
        this.saving = false;
        this.create.emit();
        this.close.emit();
      },
      error: (err) => {
        this.saving = false;
        console.error('Error creando envío:', err);
      }
    });
  }

  onCancel(): void {
    this.close.emit();
  }
}