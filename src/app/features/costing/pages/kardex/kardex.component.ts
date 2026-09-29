import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Pencil } from 'lucide-angular';

import { LoteService } from '../../../inventory/lotes-verdes/service/lote.service';
import { UserService } from '../../../users/service/users-service.service';
import { Lote } from '../../../../shared/models/lote';
import { User } from '../../../../shared/models/user';
import { PermissionAccessService } from '../../../../shared/services/permission-access.service';
import { EditPreciosComponent, PreciosLote } from '../../components/edit-precios/edit-precios.component';

@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, EditPreciosComponent],
  templateUrl: './kardex.component.html',
})
export class KardexComponent implements OnInit {
  readonly Search = Search;
  readonly Pencil = Pencil;

  lotes: Lote[] = [];
  lotesFiltrados: Lote[] = [];
  usuarios: User[] = [];
  filterText = '';

  // Modal de edición de precios
  loteEditando: Lote | null = null;

  constructor(
    private loteSvc: LoteService,
    private userSvc: UserService,
    private permissionSvc: PermissionAccessService
  ) { }

  ngOnInit(): void {
    this.userSvc.getUsers().subscribe(users => {
      this.usuarios = users ?? [];
      this.cargarLotes();
    });
  }

  cargarLotes(): void {
    this.loteSvc.getLotesOwnedByStore().subscribe(lotes => {
      this.lotes = lotes ?? [];
      this.aplicarFiltro();
    });
  }

  // ==========================================
  // EDICIÓN DE PRECIOS (MODAL)
  // ==========================================
  abrirEditarPrecios(lote: Lote): void {
    this.loteEditando = lote;
  }

  cerrarEditarPrecios(): void {
    this.loteEditando = null;
  }

  onPreciosGuardados(precios: PreciosLote): void {
    if (this.loteEditando) {
      // Actualiza la fila en memoria sin recargar toda la lista
      Object.assign(this.loteEditando, precios);
    }
    this.cerrarEditarPrecios();
  }

  // ==========================================
  // VALIDACIÓN DE ROL ADMIN
  // ==========================================
  get isAdmin(): boolean {
    try {
      const userRaw = localStorage.getItem('user');
      if (userRaw) {
        const u = JSON.parse(userRaw);
        if (u?.rol?.toLowerCase() === 'admin') return true;
      }
      const rolRaw = localStorage.getItem('rol');
      if (rolRaw && rolRaw.toLowerCase() === 'admin') return true;
      const token = localStorage.getItem('token');
      if (token && token.includes('.')) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload?.rol?.toLowerCase() === 'admin' || payload?.role?.toLowerCase() === 'admin') return true;
      }
    } catch { }
    return this.permissionSvc.hasPermission('costeo.precios-compra.read');
  }

  // ==========================================
  // FÓRMULA DE PRECIO SUGERIDO
  // ==========================================
  getPrecioSugerido(lote: Lote): number {
    const costo = lote.costo ?? 0;
    if (costo === 0) return 0;
    const costoEnvio = 1.20;
    return (costo + costoEnvio) * 1.5;
  }

  // ==========================================
  // BUSCADOR + FILTRO DE STOCK
  // ==========================================
  onSearchChange(): void {
    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    const term = this.filterText.trim().toLowerCase();

    this.lotesFiltrados = this.lotes.filter(l => {
      const stockPeso = l.peso ?? 0;
      const invArray = (l as any).inventarioLotes;
      let stockFinal = stockPeso;
      if (Array.isArray(invArray) && invArray.length > 0) {
        stockFinal = invArray.reduce((acc: number, item: any) => acc + (Number(item.cantidad_kg) || 0), 0);
      }
      if (stockFinal <= 0) return false;

      if (!term) return true;
      return l.id_lote?.toLowerCase().includes(term) ||
             l.clasificacion?.toLowerCase().includes(term) ||
             l.productor?.toLowerCase().includes(term);
    });
  }
}
