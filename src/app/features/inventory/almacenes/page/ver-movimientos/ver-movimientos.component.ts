import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { LucideAngularModule, ArrowLeft, Search, RefreshCw } from 'lucide-angular';

import { MovimientoAlmacenService } from '../../service/movimiento-almacen.service';
import { MovimientoAlmacen } from '../../../../../shared/models/movimiento-almacen';
import { Almacen } from '../../../../../shared/models/almacen';
import { AlmacenService } from '../../service/almacen.service';

type TipoMovimientoUI = 'ALL' | 'INGRESO' | 'SALIDA' | 'TRASLADO' | 'AJUSTE';

@Component({
  selector: 'app-movimientos-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  templateUrl: './ver-movimientos.component.html',
})
export class VerMovimientosPage implements OnInit {

  ArrowLeft = ArrowLeft;
  Search = Search;
  RefreshCw = RefreshCw;

  almacenId = '';

  almacen: Almacen | null = null;

  loading = false;
  errorMsg: string | null = null;

  movimientos: MovimientoAlmacen[] = [];

  // filtros UI
  q = '';
  tipo: TipoMovimientoUI = 'ALL';
  onlyConComentario = false;

  // paginación simple (front)
  page = 1;
  pageSize = 20;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly movimientoService: MovimientoAlmacenService,
    private readonly almacenService: AlmacenService,
  ) { }
  ngOnInit(): void {
    // ✅ 1) Lee bien el param (es :id)
    this.almacenId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.almacenId) {
      this.errorMsg = 'No se recibió el ID del almacén.';
      return;
    }

    // ✅ 2) recién aquí pide el almacén (para el nombre)
    this.almacenService.getAlmacenById(this.almacenId).subscribe({
      next: (data) => this.almacen = data || null,
      error: () => this.almacen = null
    });

    // ✅ 3) carga movimientos
    this.load();
  }

  load() {
    this.loading = true;
    this.errorMsg = null;

    // Cargar info del almacén (opcional, para mostrar nombre o detalles)

    this.movimientoService.getMovimientosByAlmacen(this.almacenId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => {
          this.movimientos = [...(data || [])].sort((a: any, b: any) => {
            const da = new Date(a?.fecha_registro || a?.created_at || 0).getTime();
            const db = new Date(b?.fecha_registro || b?.created_at || 0).getTime();
            return db - da;
          });
          this.page = 1;
        },
        error: (err) => {
          this.errorMsg = err?.error?.message || 'No se pudo cargar los movimientos.';
          this.movimientos = [];
        }
      });
  }

  // helpers flexibles (ajusta a tu modelo real)
  getTipo(m: any): string { return m?.tipo || m?.tipo_movimiento || '—'; }
  getEntidad(m: any): string { return m?.entidad || m?.entidad_inventario || '—'; }
  getIdEntidad(m: any): string { return m?.id_entidad || m?.idEntidad || '—'; }
  getCantidad(m: any): number | null {
    const v = m?.cantidad ?? m?.cantidad_kg ?? m?.cantidad_unidades ?? null;
    return typeof v === 'number' ? v : (v ? Number(v) : null);
  }
  getComentario(m: any): string { return m?.comentario || m?.descripcion || ''; }
  getUsuario(m: any): string { return m?.id_user || m?.usuario || ''; }
  getFecha(m: any): Date | null {
    const raw = m?.fecha_registro || m?.created_at || m?.fecha;
    return raw ? new Date(raw) : null;
  }

  // filtrado
  get filtered(): MovimientoAlmacen[] {
    const qq = this.q.trim().toLowerCase();

    return (this.movimientos || []).filter((m: any) => {
      const tipo = this.getTipo(m);
      const entidad = this.getEntidad(m);
      const idEntidad = this.getIdEntidad(m);
      const comentario = this.getComentario(m);
      const usuario = this.getUsuario(m);

      if (this.tipo !== 'ALL' && String(tipo) !== this.tipo) return false;
      if (this.onlyConComentario && !comentario) return false;

      if (!qq) return true;

      return (
        String(tipo).toLowerCase().includes(qq) ||
        String(entidad).toLowerCase().includes(qq) ||
        String(idEntidad).toLowerCase().includes(qq) ||
        String(comentario).toLowerCase().includes(qq) ||
        String(usuario).toLowerCase().includes(qq)
      );
    });
  }

  // paginado
  get total() { return this.filtered.length; }
  get totalPages() { return Math.max(1, Math.ceil(this.total / this.pageSize)); }

  get pageRows(): MovimientoAlmacen[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  next() { if (this.page < this.totalPages) this.page++; }
  prev() { if (this.page > 1) this.page--; }

  onChangeFilters() {
    this.page = 1;
  }
}