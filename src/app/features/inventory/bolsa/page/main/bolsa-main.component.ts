import { Component } from '@angular/core';
import { CommonModule, NgIf, NgFor, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, History, Sheet, ChevronDown } from 'lucide-angular';
import { Router } from '@angular/router';

import { Bolsa, BolsaConInventario } from '../../../../../shared/models/bolsa';
import { BolsaService } from '../../service/bolsa.service';
import { UserNamePipe } from '../../../../../shared/pipes/user-name-pipe.pipe';
import { User } from '../../../../../shared/models/user';
import { UserService } from '../../../../users/service/users-service.service';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-bolsa-main',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    AsyncPipe,
    LucideAngularModule,
    UserNamePipe,
  ],
  templateUrl: './bolsa-main.component.html',
  styles: []
})
export class BolsaMainComponent {

  readonly Search = Search;
  readonly History = History;
  readonly Sheet = Sheet;
  readonly ChevronDown = ChevronDown;

  bolsas: BolsaConInventario[] = [];
  private _bolsasFiltradas: BolsaConInventario[] = [];
  usuarios: User[] = [];

  filterText = '';
  filtroTipo: 'admin' | 'cliente' = 'admin';
  incluirHistorico = false;

  constructor(
    private bolsaService: BolsaService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadUsuarios();
    this.loadBolsas();
  }

  loadUsuarios() {
    this.userService.getUsers().subscribe(users => {
      this.usuarios = users ?? [];
      this.aplicarFiltro();
    });
  }

  loadBolsas() {
    this.bolsaService.getConInventario(this.incluirHistorico).subscribe(bolsas => {
      // El backend serializa la relación como "inventarioBolsas"; normalizamos a "inventarios".
      this.bolsas = (bolsas ?? []).map(b => ({
        ...b,
        inventarios: (b as any).inventarioBolsas ?? (b as any).inventarios ?? []
      }));
      this.aplicarFiltro();
    });
  }

  toggleHistorico() {
    this.incluirHistorico = !this.incluirHistorico;
    this.loadBolsas();
  }

  aplicarFiltro() {
    const term = this.filterText.trim().toLowerCase();

    this._bolsasFiltradas = this.bolsas.filter(b => {
      if (!term) return true;

      const cliente = b.owned_by_store
        ? 'fortunato'
        : (this.usuarios.find(u => u.id_user === b.id_user)?.nombre_comercial ||
           this.usuarios.find(u => u.id_user === b.id_user)?.nombre || '').toLowerCase();

      const almacenes = (b.inventarios || [])
        .map(inv => inv.almacen?.nombre?.toLowerCase() || '')
        .join(' ');

      return (
        b.id_bolsa?.toLowerCase().includes(term) ||
        b.id_lote_tostado?.toLowerCase().includes(term) ||
        b.molienda?.toLowerCase().includes(term) ||
        b.comentario?.toLowerCase().includes(term) ||
        cliente.includes(term) ||
        almacenes.includes(term)
      );
    });
  }

  getBolsasFiltradas(): BolsaConInventario[] {
    return this._bolsasFiltradas.filter(b =>
      this.filtroTipo === 'admin' ? b.owned_by_store : !b.owned_by_store
    );
  }

  onSearchChange() {
    this.aplicarFiltro();
  }

  openHistoric(bolsa: Bolsa) {
    this.router.navigate(['/inventory/bolsa/historico', bolsa.id_bolsa]);
  }

  exportBolsas() {
    const data = this.getBolsasFiltradas().map(b => {
      const cliente = b.owned_by_store
        ? 'FORTUNATO'
        : (this.usuarios.find(u => u.id_user === b.id_user)?.nombre_comercial ||
           this.usuarios.find(u => u.id_user === b.id_user)?.nombre || 'Desconocido');

      const almacenes = (b.inventarios || [])
        .map(inv => `${inv.almacen?.nombre || 'N/A'}: ${inv.cantidad} unid.`)
        .join(' | ');

      return {
        'ID Bolsa': b.id_bolsa,
        'Lote Tostado': b.id_lote_tostado,
        'Cliente': cliente,
        'Molienda': b.molienda,
        'Almacén': almacenes || 'Sin almacén',
        'Fecha Embolsado': b.fecha_embolsado
          ? new Date(b.fecha_embolsado).toLocaleDateString('es-PE')
          : '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bolsas');

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const tipo = this.filtroTipo === 'admin' ? 'Tienda' : 'Clientes';
    saveAs(blob, `bolsas_${tipo}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
}