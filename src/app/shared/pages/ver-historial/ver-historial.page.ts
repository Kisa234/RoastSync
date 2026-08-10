import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Eye } from 'lucide-angular';

import { HistorialService } from '../../services/historial.service';
import { UserNamePipe } from '../../pipes/user-name-pipe.pipe';
import { Historial } from '../../models/historial';

interface DiffRow {
  key: string;
  before: string;
  after: string;
  changed: boolean;
}

@Component({
  selector: 'app-ver-historial',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, UserNamePipe, LucideAngularModule],
  templateUrl: './ver-historial.page.html'
})
export class VerHistorialPage implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Eye = Eye;

  idHistorial = '';
  historial: Historial | null = null;
  loading = false;

  diffRows: DiffRow[] = [];
  snapshotRows: DiffRow[] = [];
  snapshotLabel = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private historialSvc: HistorialService,
  ) { }

  ngOnInit(): void {
    this.idHistorial = this.route.snapshot.paramMap.get('id') || '';
    if (!this.idHistorial) return;
    this.load();
  }

  private load(): void {
    this.loading = true;
    // ⚠️ Asume que HistorialService tiene getById — si no existe, hay que agregarlo
    // (mismo patrón que getByEntidad/getByUser: GET /historial/:id).
    this.historialSvc.getById(this.idHistorial).subscribe({
      next: (h) => {
        this.historial = h;
        this.buildRows();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar el historial:', err);
        this.loading = false;
      }
    });
  }

  private buildRows(): void {
    if (!this.historial) return;

    const antes = this.parse(this.historial.objeto_antes);
    const despues = this.parse(this.historial.objeto_despues);

    if (antes && despues) {
      // UPDATE (u otra acción con ambos snapshots): diff completo
      this.diffRows = this.buildDiff(antes, despues);
      this.snapshotRows = [];
    } else if (despues) {
      // CREATE: solo hay "después" — se muestra como snapshot final
      this.snapshotLabel = 'Estado al crearse';
      this.snapshotRows = this.buildSnapshot(despues);
      this.diffRows = [];
    } else if (antes) {
      // DELETE: solo hay "antes" — último estado antes de eliminarse
      this.snapshotLabel = 'Último estado antes de eliminarse';
      this.snapshotRows = this.buildSnapshot(antes);
      this.diffRows = [];
    } else {
      this.diffRows = [];
      this.snapshotRows = [];
    }
  }

  private parse(data: any): Record<string, any> | null {
    if (!data) return null;
    if (typeof data === 'string') {
      try { return JSON.parse(data); } catch { return null; }
    }
    return data;
  }

  private buildDiff(antes: Record<string, any>, despues: Record<string, any>): DiffRow[] {
    const keys = new Set([...Object.keys(antes), ...Object.keys(despues)]);
    return Array.from(keys).sort().map(key => {
      const before = this.formatValue(antes[key]);
      const after = this.formatValue(despues[key]);
      return { key, before, after, changed: before !== after };
    });
  }

  private buildSnapshot(obj: Record<string, any>): DiffRow[] {
    return Object.keys(obj).sort().map(key => ({
      key,
      before: '',
      after: this.formatValue(obj[key]),
      changed: false,
    }));
  }

  private formatValue(v: any): string {
    if (v === null || v === undefined || v === '') return '—';
    if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
    if (typeof v === 'boolean') return v ? 'Sí' : 'No';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  }

  /** Solo las entidades que hoy tienen histórico propio en el front pueden enlazarse.
   *  El resto (PRODUCTO, MUESTRA, INSUMO, TUESTE...) no tiene página de destino todavía. */
  get rutaEntidad(): string[] | null {
    if (!this.historial) return null;
    switch (this.historial.entidad) {
      case 'LOTE': return ['/inventory/lotes-verdes/historico', this.historial.id_entidad];
      case 'LOTE_TOSTADO': return ['/inventory/lotes-tostados/historico', this.historial.id_entidad];
      case 'BOLSA': return ['/inventory/bolsa/historico', this.historial.id_entidad];
      case 'PAQUETE': return ['/envios/paquete', this.historial.id_entidad];
      case 'ENVIO': return ['/envios', this.historial.id_entidad];
      default: return null;
    }
  }

  verEntidad(): void {
    const ruta = this.rutaEntidad;
    if (ruta) this.router.navigate(ruta);
  }

  verPedido(): void {
    if (!this.historial?.id_pedido) return;
    this.router.navigate(['/orders', this.historial.id_pedido]);
  }

  accionBadgeClass(): string {
    switch (this.historial?.accion) {
      case 'CREATE': return 'bg-green-100 text-green-700';
      case 'UPDATE': return 'bg-blue-100 text-blue-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  goBack(): void {
    this.location.back();
  }
}