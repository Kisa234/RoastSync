import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Check } from 'lucide-angular';
import { SelectSearchComponent } from '../../../../shared/components/select-search/select-search.component';

import { EnviosService } from '../../service/envios.service';
import { UserService } from '../../../users/service/users-service.service';
import { LoteTostadoService } from '../../../inventory/service/lote-tostado.service';

import { Envio } from '../../../../shared/models/envio';
import { User } from '../../../../shared/models/user';
import { LoteTostado } from '../../../../shared/models/lote-tostado';
import { Observable } from 'rxjs';
import { combineLatest } from 'rxjs';
import { map, finalize} from 'rxjs/operators';

@Component({
  selector: 'add-envio',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, SelectSearchComponent],
  templateUrl: './add-envio.component.html'
})
export class AddEnvioComponent {
  readonly X = X;
  readonly Check = Check;

  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<Envio>();

  // Datos tipados
  clientes: User[] = [];
  lotesCliente: LoteTostado[] = [];
  selectedLote: LoteTostado | null = null;

  // UI
  saving = false;
  cantidadError = '';

  // Modelo que respeta tu DTO (clasificación se calcula en backend)
  model: {
    id_cliente: string;
    id_lote_tostado: string;
    cantidad: number | null;
    comentario?: string;
  } = {
      id_cliente: '',
      id_lote_tostado: '',
      cantidad: null,
      comentario: ''
    };

  constructor(
    private enviosSvc: EnviosService,
    private userSvc: UserService,
    private loteSvc: LoteTostadoService
  ) { }

  ngOnInit(): void {
    this.loadClientes();
  }

  private loadClientes(): void {
    combineLatest([
      this.userSvc.getUsers(),
      this.loteSvc.getAll()
    ])
      .pipe(
        map(([users, lotes]) => {
          // Si quieres “cualquier lote”, quita el filtro de peso.
          const idsConLote = new Set(
            (lotes ?? [])
              .filter((l: LoteTostado) => (l.peso ?? 0) > 0) // ⇦ solo con stock
              .map((l: LoteTostado) => l.id_user)
          );
          return (users ?? []).filter((u: User) => idsConLote.has(u.id_user));
        })
      )
      .subscribe((filtered: User[]) => {
        this.clientes = filtered;
      });
  }

  onClienteChange(id_user: string): void {
    this.model.id_cliente = id_user || '';
    this.model.id_lote_tostado = '';
    this.model.cantidad = null;
    this.selectedLote = null;
    this.cantidadError = '';
    this.loadLotesByCliente(id_user);
  }

  loadingLotes = false;

  private loadLotesByCliente(id_user: string): void {
    this.lotesCliente = [];
    this.selectedLote = null;
    this.loadingLotes = true;

    const lotes$: Observable<LoteTostado[]> = this.loteSvc.getAll();

    lotes$
      .pipe(
        map((list: LoteTostado[]) =>
          (list ?? []).filter(l =>
            l.id_user === id_user && (l.peso ?? 0) > 0
          )
        ),
        finalize(() => this.loadingLotes = false)
      )
      .subscribe({
        next: (items: LoteTostado[]) => {
          this.lotesCliente = items;
        },
        error: () => {
          this.lotesCliente = [];
        }
      });
  }

  onLoteChange(id: string): void {
    this.selectedLote = this.lotesCliente.find(l => l.id_lote_tostado === id) ?? null;
    this.validarCantidad();
  }

  validarCantidad(): void {
    this.cantidadError = '';
    const qty = Number(this.model.cantidad ?? 0);
    const stock = Number(this.selectedLote?.peso ?? 0);

    if (!qty || qty <= 0) return;
    if (!Number.isInteger(qty)) {
      this.cantidadError = 'La cantidad debe ser un entero en gramos.';
      return;
    }
    if (qty > stock) {
      this.cantidadError = 'La cantidad excede el stock disponible del lote.';
    }
  }

  canSave(): boolean {
    return !!(
      this.model.id_cliente &&
      this.model.id_lote_tostado &&
      this.model.cantidad &&
      this.model.cantidad > 0 &&
      !this.cantidadError
    );
  }

  save(): void {
    if (!this.canSave()) return;
    this.saving = true;

    const payload: {
      origen: 'LOTE_TOSTADO';
      id_lote_tostado: string;
      id_cliente: string;
      cantidad: number;
      comentario?: string;
    } = {
      origen: 'LOTE_TOSTADO',
      id_lote_tostado: this.model.id_lote_tostado,
      id_cliente: this.model.id_cliente,
      cantidad: this.model.cantidad!,
      comentario: this.model.comentario?.trim() || undefined
    };

    console.log(payload);

    this.enviosSvc.createEnvio(payload).subscribe({
      next: (envio) => {
        this.saving = false;
        this.create.emit(envio);
      },
      error: (err) => {
        this.saving = false;
        console.error('Error creando envío', err);
      }
    });
  }

  onCancel(): void {
    this.close.emit();
  }
}
