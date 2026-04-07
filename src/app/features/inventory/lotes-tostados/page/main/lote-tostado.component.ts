import { Component } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Search,
  Eye,
  Clipboard,
  History,
  TestTube,
  Tag
} from 'lucide-angular';
import { Router, RouterOutlet } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { formatDate } from '@angular/common';

import { User } from '../../../../../shared/models/user';
import { LoteTostadoService } from '../../service/lote-tostado.service';
import { UserService } from '../../../../users/service/users-service.service';
import { UiService } from '../../../../../shared/services/ui.service';
import { FichaTuesteComponent } from '../../../../../shared/components/ficha-tueste/ficha-tueste.component';
import { UserNamePipe } from '../../../../../shared/pipes/user-name-pipe.pipe';
import { LoteTostadoConInventario } from '../../../../../shared/models/lote-tostado';
import { AddInventoryLoteTostadoComponent } from "../../components/add-inventory-lote-tostado/add-inventory-lote-tostado.component";

type FilterKey = 'todos' | 'enviados' | 'no-enviados';

@Component({
  selector: 'app-lote-tostado',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    LucideAngularModule,
    FichaTuesteComponent,
    UserNamePipe,
    RouterOutlet,
    AddInventoryLoteTostadoComponent
  ],
  templateUrl: './lote-tostado.component.html',
  styles: []
})
export class LoteTostadoComponent {

  readonly Search = Search;
  readonly Eye = Eye;
  readonly Clipboard = Clipboard;
  readonly History = History;
  readonly TestTube = TestTube;
  readonly Tag = Tag;

  tostados: LoteTostadoConInventario[] = [];
  tostadosFiltrados: LoteTostadoConInventario[] = [];
  usuarios: User[] = [];
  costoInventario = 0;

  filterTextTostado = '';
  filterTostado: FilterKey = 'no-enviados';

  filtersTostado = [
    { key: 'todos', label: 'HISTORICO' },
    { key: 'enviados', label: 'LOTES ENVIADOS' },
    { key: 'no-enviados', label: 'LOTES DISPONIBLES' }
  ];

  startDate = '';
  endDate = '';

  showHistoric = false;
  showReport = false;
  showFicha = false;

  selectedTuesteId = '';
  selectedLoteTostado: LoteTostadoConInventario | null = null;
  showAsignarInventarioModal = false;

  constructor(
    private loteTostadoService: LoteTostadoService,
    private userService: UserService,
    private uiService: UiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadUsuarios();
    this.loadTostados();
  }

  loadUsuarios() {
    this.userService.getUsers().subscribe(users => {
      this.usuarios = users;
    });
  }

  loadTostados() {
    this.loteTostadoService.getLotesTostadosConInventario().subscribe(tostados => {
      this.tostados = tostados;
      this.aplicarFiltro();
    });
  }

  aplicarFiltro() {
    let result = [...this.tostados];

    switch (this.filterTostado) {
      case 'enviados':
        result = result.filter(t => !!t.entregado && t.peso === 0);
        break;
      case 'no-enviados':
        result = result.filter(t => !t.entregado || t.peso > 0);
        break;
    }

    if (this.filterTextTostado.trim()) {
      const term = this.filterTextTostado.toLowerCase();

      result = result.filter(t => {
        const user = this.usuarios.find(u => u.id_user === t.id_user);
        const cliente = (user?.nombre_comercial || user?.nombre || '').toLowerCase();

        const almacenes = (t.inventarioLotesTostados || [])
          .map(inv => inv.almacen?.nombre?.toLowerCase() || '')
          .join(' ');

        const variedadesTexto = (t.lote?.variedades || []).join(' ').toLowerCase();

        return (
          t.id_lote_tostado?.toLowerCase().includes(term) ||
          t.perfil_tostado?.toLowerCase().includes(term) ||
          cliente.includes(term) ||
          t.lote?.productor?.toLowerCase().includes(term) ||
          t.lote?.distrito?.toLowerCase().includes(term) ||
          variedadesTexto.includes(term) ||
          (t.lote?.clasificacion || '').toLowerCase().includes(term) ||
          (t.lote?.proceso || '').toLowerCase().includes(term) ||
          (t.lote?.id_lote || '').toLowerCase().includes(term) ||
          almacenes.includes(term)
        );
      });
    }

    if (this.startDate || this.endDate) {
      const desde = this.startDate ? new Date(this.startDate) : null;
      const hasta = this.endDate ? new Date(this.endDate) : null;

      if (hasta) {
        hasta.setHours(23, 59, 59, 999);
      }

      result = result.filter(t => {
        const fecha = new Date(t.fecha_tostado);
        return (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
      });
    }

    this.tostadosFiltrados = result;

    this.costoInventario = result
      .filter(t => {
        const user = this.usuarios.find(u => u.id_user === t.id_user);
        return user?.rol === 'admin';
      })
      .reduce((total, t) => {
        const pesoInventario = this.getPesoInventarioTostado(t);
        const costo = Number(t.lote?.costo || 0);
        return total + costo * pesoInventario;
      }, 0);
  }

  onSearchChange() {
    this.aplicarFiltro();
  }

  aplicarFiltroEstado(key: string) {
    this.filterTostado = key as FilterKey;
    this.aplicarFiltro();
  }

  onDateChange() {
    this.aplicarFiltro();
  }

  getPesoInventarioTostado(t: LoteTostadoConInventario): number {
    return (t.inventarioLotesTostados || []).reduce(
      (total, inv) => total + Number(inv.cantidad_kg || 0),
      0
    );
  }

  openAsignarInventarioLoteTostado(lote: LoteTostadoConInventario): void {
    this.selectedLoteTostado = lote;
    this.showAsignarInventarioModal = true;
  }

  closeAsignarInventarioLoteTostado(): void {
    this.selectedLoteTostado = null;
    this.showAsignarInventarioModal = false;
  }

  onInventarioLoteTostadoCreated(): void {
    this.closeAsignarInventarioLoteTostado();
    this.loadTostados();
  }

  onReportTueste(t: LoteTostadoConInventario) {
    this.router.navigate(
      ['/inventory/lotes-tostados/reporte', t.id_lote_tostado]
    );
  }

  openHistoric(t: LoteTostadoConInventario) {
    this.router.navigate(
      ['/inventory/lotes-tostados/historico', t.id_lote_tostado]
    );
  }

  openFicha(t: LoteTostadoConInventario) {
    this.selectedTuesteId = t.id_lote_tostado;
    this.showFicha = true;
  }

  openReportAnalisis(t: LoteTostadoConInventario) {
    if (!t.id_analisis_rapido) {
      this.uiService.alert('error', 'Error', 'El lote no tiene análisis asociado');
      return;
    }

    this.selectedTuesteId = t.id_lote_tostado;
    this.showReport = true;
  }

  async exportStickerTostado(t: LoteTostadoConInventario) {
    const lote = t.id_lote ?? '';
    const fecha = t.fecha_tostado
      ? formatDate(new Date(t.fecha_tostado), 'dd/MM/yyyy', 'es-PE')
      : formatDate(new Date(), 'dd/MM/yyyy', 'es-PE');

    let cliente = '';
    try {
      const user = await firstValueFrom(this.userService.getUserById(t.id_user));
      cliente = user?.nombre_comercial || user?.nombre || '';
    } catch { }

    const W = 1400, H = 320, dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';

    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    const cols = [700, 440, 260];
    const x = [20, 20 + cols[0], 20 + cols[0] + cols[1]];
    const yHeader = 70, yValue = 170;

    ctx.font = '600 26px system-ui';
    ctx.fillStyle = '#111111';
    ['Lote', 'Cliente', 'Fecha'].forEach((h, i) => ctx.fillText(h, x[i], yHeader));

    ctx.beginPath();
    ctx.moveTo(20, yHeader + 16);
    ctx.lineTo(W - 20, yHeader + 16);
    ctx.strokeStyle = '#999999';
    ctx.stroke();

    const valueFont = '500 36px ui-monospace';
    ctx.font = valueFont;

    const drawFit = (text: string, xi: number, maxW: number) => {
      let size = 36;
      while (ctx.measureText(text).width > maxW && size > 12) {
        size -= 1;
        ctx.font = valueFont.replace(/\d+px/, size + 'px');
      }
      ctx.fillText(text, xi, yValue);
      ctx.font = valueFont;
    };

    drawFit(String(lote), x[0], cols[0] - 30);
    drawFit(String(cliente), x[1], cols[1] - 30);
    ctx.fillText(String(fecha), x[2], yValue);

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `StickerTostado_${lote}_${formatDate(new Date(), 'yyyyMMdd_HHmm', 'es-PE')}.png`;
    a.click();
    a.remove();
  }
}