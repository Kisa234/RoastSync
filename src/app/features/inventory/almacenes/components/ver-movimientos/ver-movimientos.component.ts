import { Almacen } from './../../../../../shared/models/almacen';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { LucideAngularModule, X, Search } from 'lucide-angular';

import { MovimientoAlmacenService } from '../../service/movimiento-almacen.service';
import { MovimientoAlmacen } from '../../../../../shared/models/movimiento-almacen';
import { AlmacenService } from '../../service/almacen.service';
import { UserNamePipe } from "../../../../../shared/pipes/user-name-pipe.pipe";

type TipoMovimientoUI = 'ALL' | 'INGRESO' | 'SALIDA' | 'TRASLADO' | 'AJUSTE';

@Component({
  selector: 'ver-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, UserNamePipe],
  templateUrl: './ver-movimientos.component.html',
})
export class VerMovimientosComponent implements OnChanges, OnInit {

  @Input({ required: true }) almacenId!: string;
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>(); 
  X = X;
  Search = Search;

  loading = false;
  errorMsg: string | null = null;

  movimientos: MovimientoAlmacen[] = [];

  // UI filtros
  q = '';
  tipo: TipoMovimientoUI = 'ALL';
  onlyConComentario = false;

  Almacen: Almacen | null = null;

  constructor(
    private readonly movimientoService: MovimientoAlmacenService,
    private readonly almacenService: AlmacenService
  ) {}

  ngOnInit(): void {
    this.almacenService.getAlmacenById(this.almacenId).subscribe({
      next: (data) => this.Almacen = data,
      error: () => this.Almacen = null
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // ✅ cargar cuando llega/cambia el almacenId
    if (changes['almacenId'] && this.almacenId) {
      this.load();
    }
  }

  onCancel() {
    this.close.emit();
  }

  refreshParent() {
    // ✅ opcional: si quieres refrescar el listado del padre al cerrar o al refrescar
    this.create.emit();
  }

  load() {
    this.loading = true;
    this.errorMsg = null;

    this.movimientoService.getMovimientosByAlmacen(this.almacenId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => {
          this.movimientos = [...(data || [])].sort((a: any, b: any) => {
            const da = new Date(a?.fecha_registro || a?.created_at || 0).getTime();
            const db = new Date(b?.fecha_registro || b?.created_at || 0).getTime();
            return db - da;
          });
        },
        error: (err) => {
          this.errorMsg = err?.error?.message || 'No se pudo cargar los movimientos.';
          this.movimientos = [];
        }
      });
  }

  // Helpers flexibles (ajústalo si tu interface ya tiene nombres exactos)
  getTipo(m: any): string {
    return m?.tipo || m?.tipo_movimiento || '—';
  }
  getEntidad(m: any): string {
    return m?.entidad || m?.entidad_inventario || '—';
  }
  getIdEntidad(m: any): string {
    return m?.id_entidad || m?.idEntidad || '—';
  }
  getCantidad(m: any): number | null {
    const v = m?.cantidad ?? m?.cantidad_kg ?? m?.cantidad_unidades ?? null;
    return typeof v === 'number' ? v : (v ? Number(v) : null);
  }
  getComentario(m: any): string {
    return m?.comentario || m?.descripcion || '';
  }
  getUsuario(m: any): string {
    return m?.id_user || m?.usuario || '';
  }
  getFecha(m: any): Date | null {
    const raw = m?.fecha_registro || m?.created_at || m?.fecha;
    return raw ? new Date(raw) : null;
  }

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

  get count() {
    return this.filtered.length || 0;
  }
}