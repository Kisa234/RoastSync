import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search } from 'lucide-angular';

import { LoteService } from '../../../inventory/lotes-verdes/service/lote.service';

import { UserService } from '../../../users/service/users-service.service';
import { Lote, LoteVerdeConInventario } from '../../../../shared/models/lote';
import { User } from '../../../../shared/models/user';
import { PermissionAccessService } from '../../../../shared/services/permission-access.service';

@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './kardex.component.html',
})
export class KardexComponent implements OnInit {
  readonly Search = Search;

  lotes: Lote [] = [];
  lotesFiltrados: Lote[] = [];
  usuarios: User[] = [];
  filterText = '';

  // ==========================================
  // DICCIONARIO DE PRECIOS ESTÁTICOS (Excel)
  // ==========================================
  preciosEstaticos: Record<string, { p1: number, e2: number, e3: number }> = {
    'BVBL--34':   { p1: 41, e2: 39, e3: 37 },
    'DRBL--11':   { p1: 49, e2: 46, e3: 44 },
    'TJCA--13':   { p1: 49, e2: 46, e3: 44 },
    'JMBL--9':    { p1: 51, e2: 49, e3: 47 },
    'DMMA--28':   { p1: 45, e2: 43, e3: 40 },
    'LABOA-37':   { p1: 60, e2: 58, e3: 55 },
    'SPTY--13':   { p1: 49, e2: 46, e3: 44 },
    'LACANA-37':  { p1: 0,  e2: 68, e3: 65 },
    'JPGENA--27': { p1: 66, e2: 63, e3: 60 },
    'LACA-36':    { p1: 66, e2: 63, e3: 60 },
    'FCBORNA-8':  { p1: 60, e2: 58, e3: 55 },
    'VGBO-7':     { p1: 50, e2: 50, e3: 48 },
    'FABORNA-10': { p1: 0,  e2: 90, e3: 85 },
    'LABOHO-36':  { p1: 0,  e2: 60, e3: 58 },
    'JRBOR--33':  { p1: 0,  e2: 85, e3: 80 },
    'FAGENA-11':  { p1: 0,  e2: 90, e3: 85 },
    'CGBL--19':   { p1: 31, e2: 29, e3: 27 },
    'CABOA-13':   { p1: 0,  e2: 0,  e3: 0 },
    'TJCA-14':    { p1: 49, e2: 47, e3: 45 },
    'LACAA--18':  { p1: 0,  e2: 0,  e3: 0 },
  };

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
    this.loteSvc.getLotesOwnedByStore ().subscribe(lotes => {
      this.lotes = lotes ?? [];
      this.aplicarFiltro();
    });
  }

  // ==========================================
  // LÓGICA DE PRECIOS
  // ==========================================
  
  // Fórmula: (Costo + 1.20) / (1 - 0.30)
  getPrecioSugerido(lote: Lote): number {
    const costo = lote.costo ?? 0;
    if (costo === 0) return 0; // Si no hay costo, no sugerimos precio
    
    const costoEnvio = 1.20;
    const ganancia = 0.50; // 50%
    return (costo + costoEnvio) / (1 - ganancia);
  }

  // Busca los precios fijos en el diccionario
  getPreciosFijos(id_lote: string) {
    const defaults = { p1: 0, e2: 0, e3: 0 };
    if (!id_lote) return defaults;
    return this.preciosEstaticos[id_lote] || defaults;
  }

  get canVerPrecioCompra(): boolean {
    return this.permissionSvc.hasPermission('costeo.precios-compra.read');
  }

  // ==========================================
  // BUSCADOR
  // ==========================================
  onSearchChange(): void {
    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    const term = this.filterText.trim().toLowerCase();

    this.lotesFiltrados = this.lotes.filter(l => {

      // Buscador de texto
      if (!term) return true;
      return l.id_lote?.toLowerCase().includes(term) ||
             l.clasificacion?.toLowerCase().includes(term) ||
             l.productor?.toLowerCase().includes(term);
    });
  }
}