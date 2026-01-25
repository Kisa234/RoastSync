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
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { formatDate } from '@angular/common';

/* ===== MODELOS ===== */
import { LoteTostado } from '../../../../../shared/models/lote-tostado';
import { Lote } from '../../../../../shared/models/lote';
import { User } from '../../../../../shared/models/user';

/* ===== SERVICES ===== */
import { LoteTostadoService } from '../../../service/lote-tostado.service';
import { LoteService } from '../../../service/lote.service';
import { UserService } from '../../../../users/service/users-service.service';
import { UiService } from '../../../../../shared/services/ui.service';

/* ===== COMPONENTES ===== */
import { HistoricLoteTostadoComponent } from '../../../components/historic-lote-tostado/historic-lote-tostado.component';
import { ReportLoteTostadoComponent } from '../../../components/report-lote-tostado/report-lote-tostado.component';
import { FichaTuesteComponent } from '../../../../../shared/components/ficha-tueste/ficha-tueste.component';

/* ===== PIPES ===== */
import { UserNamePipe } from '../../../../../shared/pipes/user-name-pipe.pipe';

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
    HistoricLoteTostadoComponent,
    ReportLoteTostadoComponent,
    FichaTuesteComponent,
    UserNamePipe
  ],
  templateUrl: './lote-tostado.component.html',
  styles: []
})
export class LoteTostadoComponent {

  /* ===== ICONOS ===== */
  readonly Search = Search;
  readonly Eye = Eye;
  readonly Clipboard = Clipboard;
  readonly History = History;
  readonly TestTube = TestTube;
  readonly Tag = Tag;

  /* ===== DATA ===== */
  tostados: LoteTostado[] = [];
  tostadosFiltrados: LoteTostado[] = [];
  lotesVerdeMap = new Map<string, Lote>();
  usuarios: User[] = [];

  /* ===== UI STATE ===== */
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

  constructor(
    private loteTostadoService: LoteTostadoService,
    private loteService: LoteService,
    private userService: UserService,
    private uiService: UiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadUsuarios();
    this.loadLotesVerde();
  }

  /* =========================
     CARGA DE DATA
     ========================= */

  loadUsuarios() {
    this.userService.getUsers().subscribe(users => {
      this.usuarios = users;
    });
  }

  loadLotesVerde() {
    this.loteService.getAll().subscribe(lotes => {
      this.lotesVerdeMap = new Map(lotes.map(l => [l.id_lote, l]));
      this.loadTostados();
    });
  }

  loadTostados() {
    this.loteTostadoService.getAll().subscribe(tostados => {
      this.tostados = tostados.map(t => {
        const loteVerde = this.lotesVerdeMap.get(t.id_lote);
        return {
          ...t,
          productor: loteVerde?.productor ?? ''
        };
      });

      this.aplicarFiltro();
    });
  }

  /* =========================
     FILTROS
     ========================= */

  aplicarFiltro() {
    let result = [...this.tostados];

    // filtro por estado
    switch (this.filterTostado) {
      case 'enviados':
        result = result.filter(t => !!t.entregado && t.peso === 0);
        break;
      case 'no-enviados':
        result = result.filter(t => !t.entregado || t.peso > 0);
        break;
    }

    // filtro por texto
    if (this.filterTextTostado.trim()) {
      const term = this.filterTextTostado.toLowerCase();

      result = result.filter(t => {
        const user = this.usuarios.find(u => u.id_user === t.id_user);
        const cliente = (user?.nombre_comercial || user?.nombre || '').toLowerCase();
        const loteVerde = this.lotesVerdeMap.get(t.id_lote);

        return (
          t.id_lote_tostado?.toLowerCase().includes(term) ||
          t.perfil_tostado?.toLowerCase().includes(term) ||
          cliente.includes(term) ||
          loteVerde?.productor?.toLowerCase().includes(term) ||
          loteVerde?.distrito?.toLowerCase().includes(term) ||
          loteVerde?.variedades.join(' ').toLowerCase().includes(term) ||
          loteVerde?.clasificacion?.toLowerCase().includes(term) ||
          loteVerde?.proceso?.toLowerCase().includes(term) ||
          loteVerde?.id_lote.toLowerCase().includes(term)
        );
      });
    }

    this.tostadosFiltrados = result;
  }

  onSearchChange() {
    this.aplicarFiltro();
  }

  aplicarFiltroEstado(key: string) {
    this.filterTostado = key as FilterKey;
    this.aplicarFiltro();
  }

  onDateChange() {
    const desde = this.startDate ? new Date(this.startDate) : null;
    const hasta = this.endDate ? new Date(this.endDate) : null;

    this.tostadosFiltrados = this.tostadosFiltrados.filter(t => {
      const fecha = new Date(t.fecha_tostado);
      return (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
    });
  }

  /* =========================
     ACCIONES
     ========================= */

  onReportTueste(t: LoteTostado) {
    this.router.navigate(['/report-lote-tostado', t.id_lote_tostado]);
  }

  openHistoric(t: LoteTostado) {
    this.selectedTuesteId = t.id_lote_tostado;
    this.showHistoric = true;
  }

  openFicha(t: LoteTostado) {
    this.selectedTuesteId = t.id_lote_tostado;
    this.showFicha = true;
  }

  openReportAnalisis(t: LoteTostado) {
    if (!t.id_analisis_rapido) {
      this.uiService.alert('error', 'Error', 'El lote no tiene análisis asociado');
      return;
    }
    this.selectedTuesteId = t.id_lote_tostado;
    this.showReport = true;
  }

  /* =========================
     EXPORT STICKER
     ========================= */

  async exportStickerTostado(t: LoteTostado) {
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
