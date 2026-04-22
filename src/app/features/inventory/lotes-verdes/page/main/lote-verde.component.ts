import { Component } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Eye, Edit2, Trash2, History, Plus, EyeOff } from 'lucide-angular';

import { ReportLoteComponent } from '../../../../../shared/components/report-lote/report-lote.component';
import { UserNamePipe } from '../../../../../shared/pipes/user-name-pipe.pipe';
import { Lote, LoteVerdeConInventario } from '../../../../../shared/models/lote';
import { User } from '../../../../../shared/models/user';
import { UserService } from '../../../../users/service/users-service.service';
import { UiService } from '../../../../../shared/services/ui.service';
import { Router, RouterOutlet } from '@angular/router';
import { AddLoteComponent } from '../../../lotes-verdes/components/add-lote/add-lote.component';
import { AddInventoryComponent } from '../../../lotes-verdes/components/add-inventory/add-inventory.component';
import { EditLoteComponent } from '../../../lotes-verdes/components/edit-lote/edit-lote.component';
import { LoteService } from '../../../lotes-verdes/service/lote.service';

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
    AddInventoryComponent,
    EditLoteComponent,
    ReportLoteComponent,
    UserNamePipe,
    RouterOutlet
  ],
  templateUrl: './lote-verde.component.html',
  styles: []
})
export class LoteVerdeComponent {

  readonly Search = Search;
  readonly Eye = Eye;
  readonly Edit2 = Edit2;
  readonly Trash2 = Trash2;
  readonly History = History;
  readonly Plus = Plus;
  readonly EyeOff = EyeOff;

  lotes: LoteVerdeConInventario[] = [];
  private _lotesFiltrados: LoteVerdeConInventario[] = [];

  public get lotesFiltrados(): LoteVerdeConInventario[] {
    return this._lotesFiltrados;
  }

  public set lotesFiltrados(value: LoteVerdeConInventario[]) {
    this._lotesFiltrados = value;
  }

  usuarios: User[] = [];

  filterTextVerde = '';
  costoInventarioVerde = 0;

  showAddLote = false;
  showEditLote = false;
  showReportLote = false;
  showAddInventory = false;

  selectedLoteId = '';

  constructor(
    private loteService: LoteService,
    private userService: UserService,
    private uiService: UiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadUsuarios();
    this.loadLotes();
  }

  loadUsuarios() {
    this.userService.getUsers().subscribe(users => {
      this.usuarios = users ?? [];
      this.aplicarFiltro();
    });
  }

  loadLotes() {
    this.loteService.getLotesVerdesConInventario().subscribe(lotes => {
      this.lotes = lotes ?? [];
      this.aplicarFiltro();
    });
  }

  getPesoInventario(l: LoteVerdeConInventario): number {
    return (l.inventarioLotes || []).reduce(
      (total, inv) => total + Number(inv.cantidad_kg || 0),
      0
    );
  }
  filtroTipo: 'admin' | 'cliente' = 'admin';

  getLotesFiltrados(): LoteVerdeConInventario[] {
    if (this.filterTextVerde.trim()) {
      return this.lotesFiltrados;
    }

    return this.lotesFiltrados.filter(l => {
      const user = this.usuarios.find(u => u.id_user === l.id_user);
      return user?.rol === this.filtroTipo;
    });
  }

  aplicarFiltro() {
    const term = this.filterTextVerde.trim().toLowerCase();
    this.costoInventarioVerde = 0;

    this.lotesFiltrados = this.lotes.filter(l => {
      const user = this.usuarios.find(u => u.id_user === l.id_user);
      const cliente = (user?.nombre_comercial || user?.nombre || '').toLowerCase();

      const match =
        !term ||
        l.id_lote?.toLowerCase().includes(term) ||
        l.productor?.toLowerCase().includes(term) ||
        l.distrito?.toLowerCase().includes(term) ||
        l.variedades?.join(' ').toLowerCase().includes(term) ||
        l.clasificacion?.toLowerCase().includes(term) ||
        l.proceso?.toLowerCase().includes(term) ||
        cliente.includes(term);

      if (match && user?.rol === 'admin') {
        const pesoInventarioGr = this.getPesoInventario(l);
        const pesoInventarioKg = pesoInventarioGr / 1000;

        this.costoInventarioVerde += Number(l.costo ?? 0) * pesoInventarioKg;
      }

      return match;
    });
  }

  onSearchChange() {
    this.aplicarFiltro();
  }

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

  getVariedadesArray(variedades: string | string[]): string[] {
    if (Array.isArray(variedades)) return variedades;
    if (!variedades) return [];

    return variedades
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);
  }

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
    this.router.navigate(['/inventory/lotes-verdes/historico', l.id_lote]);
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

  onCreated() {
    this.showAddLote = false;
    this.loadLotes();
  }

  onUpdated() {
    this.showEditLote = false;
    this.loadLotes();
  }

  openAsignar(lote: Lote) {
    this.selectedLoteId = lote.id_lote;
    this.showAddInventory = true;
  }

  onInventoryCreated() {
    this.showAddInventory = false;
    this.loadLotes();
  }
}