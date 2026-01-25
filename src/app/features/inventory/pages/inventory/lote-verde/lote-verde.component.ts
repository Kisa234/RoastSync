import { Component } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Eye, Edit2, Trash2, History, Plus } from 'lucide-angular';
import { AddLoteComponent } from '../../../components/add-lote/add-lote.component';
import { EditLoteComponent } from '../../../components/edit-lote/edit-lote.component';
import { HistoricLoteComponent } from '../../../components/historic-lote/historic-lote.component';
import { ReportLoteComponent } from '../../../../../shared/components/report-lote/report-lote.component';
import { UserNamePipe } from '../../../../../shared/pipes/user-name-pipe.pipe';
import { Lote } from '../../../../../shared/models/lote';
import { User } from '../../../../../shared/models/user';
import { LoteService } from '../../../service/lote.service';
import { UserService } from '../../../../users/service/users-service.service';
import { UiService } from '../../../../../shared/services/ui.service';


@Component({
  selector: 'app-lote-verde',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    LucideAngularModule,
    AddLoteComponent,
    EditLoteComponent,
    HistoricLoteComponent,
    ReportLoteComponent,
    UserNamePipe
  ],
  templateUrl: './lote-verde.component.html',
  styles: []
})
export class LoteVerdeComponent {

  // ICONOS
  readonly Search = Search;
  readonly Eye = Eye;
  readonly Edit2 = Edit2;
  readonly Trash2 = Trash2;
  readonly History = History;
  readonly Plus = Plus;

  // DATA
  lotes: Lote[] = [];
  private _lotesFiltrados: Lote[] = [];
  public get lotesFiltrados(): Lote[] {
    return this._lotesFiltrados;
  }
  public set lotesFiltrados(value: Lote[]) {
    this._lotesFiltrados = value;
  }
  usuarios: User[] = [];

  // UI STATE
  filterTextVerde = '';
  costoInventarioVerde = 0;

  showAddLote = false;
  showEditLote = false;
  showHistoricLote = false;
  showReportLote = false;

  selectedLoteId = '';

  constructor(
    private loteService: LoteService,
    private userService: UserService,
    private uiService: UiService
  ) {}

  ngOnInit() {
    this.loadUsuarios();
    this.loadLotes();
  }

  /* =========================
     DATA LOAD
     ========================= */

  loadUsuarios() {
    this.userService.getUsers().subscribe(users => {
      this.usuarios = users;
    });
  }

  loadLotes() {
    this.loteService.getAll().subscribe(lotes => {
      this.lotes = lotes;
      this.aplicarFiltro();
    });
  }

  /* =========================
     FILTROS
     ========================= */

  aplicarFiltro() {
    const term = this.filterTextVerde.toLowerCase();
    this.costoInventarioVerde = 0;

    this.lotesFiltrados = this.lotes.filter(l => {
      const user = this.usuarios.find(u => u.id_user === l.id_user);
      const cliente = (user?.nombre_comercial || user?.nombre || '').toLowerCase();

      const match =
        !term ||
        l.id_lote.toLowerCase().includes(term) ||
        l.productor?.toLowerCase().includes(term) ||
        l.distrito?.toLowerCase().includes(term) ||
        l.variedades?.join(' ').toLowerCase().includes(term) ||
        l.clasificacion?.toLowerCase().includes(term) ||
        l.proceso?.toLowerCase().includes(term) ||
        cliente.includes(term);

      if (match && user?.rol === 'admin') {
        this.costoInventarioVerde += (l.costo ?? 0) * l.peso;
      }

      return match;
    });
  }

  onSearchChange() {
    this.aplicarFiltro();
  }

  /* =========================
     HELPERS (ADMIN / CLIENTE)
     ========================= */

  getLotesAdmin() {
    return this.lotesFiltrados.filter(l => {
      const user = this.usuarios.find(u => u.id_user === l.id_user);
      return user?.rol === 'admin';
    });
  }

  getLotesCliente() {
    return this.lotesFiltrados.filter(l => {
      const user = this.usuarios.find(u => u.id_user === l.id_user);
      return user?.rol === 'cliente';
    });
  }

  /* =========================
     ACCIONES
     ========================= */

  onReport(l: Lote) {
    this.loteService.getById(l.id_lote).subscribe(lote => {
      if (!lote?.id_analisis) {
        this.uiService.alert('error', 'Error', 'El lote no tiene análisis asociado');
        return;
      }
      this.selectedLoteId = l.id_lote;
      this.showReportLote = true;
    });
  }

  openHistoric(l: Lote) {
    this.selectedLoteId = l.id_lote;
    this.showHistoricLote = true;
  }

  openEdit(l: Lote) {
    this.selectedLoteId = l.id_lote;
    this.showEditLote = true;
  }

  delete(l: Lote) {
    this.uiService.confirm({
      title: 'Eliminar lote',
      message: `¿Estás seguro de eliminar el lote ${l.id_lote}?`,
      confirmText: 'Sí',
      cancelText: 'No'
    }).then(ok => {
      if (!ok) return;

      this.loteService.delete(l.id_lote).subscribe({
        next: () => {
          this.uiService.alert('success', 'Éxito', 'Lote eliminado');
          this.loadLotes();
        },
        error: () => {
          this.uiService.alert('error', 'Error', 'No se pudo eliminar el lote');
        }
      });
    });
  }

  /* =========================
     MODALES
     ========================= */

  onCreated() {
    this.showAddLote = false;
    this.loadLotes();
  }

  onUpdated() {
    this.showEditLote = false;
    this.loadLotes();
  }
}
