import { Component } from '@angular/core';
import { AsyncPipe, CommonModule, JsonPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, History, CheckCircle, Pencil, Tag } from 'lucide-angular';
import { Search, Eye, Edit2, Trash2, Clipboard, TestTube } from 'lucide-angular';
import { map, Observable, tap } from 'rxjs';
import { AddLoteComponent } from '../../components/add-lote/add-lote.component';
import { AddMuestraComponent } from '../../components/add-muestra/add-muestra.component';
import { ReportLoteComponent } from '../../../../shared/components/report-lote/report-lote.component';
import { FichaTuesteComponent } from '../../../../shared/components/ficha-tueste/ficha-tueste.component';
import { BlendLoteComponent } from '../../components/blend-lote/blend-lote.component';
import { BlendTueste } from '../../components/blend-tueste/blend-tueste.component';
import { Muestra } from '../../../../shared/models/muestra';
import { Lote } from '../../../../shared/models/lote';
import { LoteTostado } from '../../../../shared/models/lote-tostado';
import { MuestraService } from '../../service/muestra.service';
import { LoteService } from '../../service/lote.service';
import { LoteTostadoService } from '../../service/lote-tostado.service';
import { UserService } from '../../../users/service/users-service.service';
import { UiService } from '../../../../shared/services/ui.service';
import { User } from '../../../../shared/models/user';
import { UserNamePipe } from '../../../../shared/pipes/user-name-pipe.pipe';
import { Router } from '@angular/router';
import { HistoricLoteComponent } from '../../components/historic-lote/historic-lote.component';
import { firstValueFrom } from 'rxjs';
import { formatDate } from '@angular/common';
import { HistoricLoteTostadoComponent } from "../../components/historic-lote-tostado/historic-lote-tostado.component";
import { EditLoteComponent } from '../../components/edit-lote/edit-lote.component';
import { ReportLoteTostadoComponent } from "../../components/report-lote-tostado/report-lote-tostado.component";


type InventoryTab = 'muestras' | 'verde' | 'tostado';
type FilterKey = 'todas' | 'sin-completar' | 'completadas' | 'enviados' | 'no-enviados' | 'todos';

@Component({
  selector: 'inventory-page',
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    AsyncPipe,
    LucideAngularModule,
    AddLoteComponent,
    AddMuestraComponent,
    ReportLoteComponent,
    EditLoteComponent,
    FichaTuesteComponent,
    BlendLoteComponent,
    HistoricLoteComponent,
    FormsModule,
    BlendTueste,
    UserNamePipe,
    HistoricLoteTostadoComponent,
    ReportLoteTostadoComponent
],
  templateUrl: './inventory-page.component.html',
  styles: ``
})

export class InventoryPage {
  // iconos
  readonly Search = Search;
  readonly Eye = Eye;
  readonly Edit2 = Edit2;
  readonly Trash2 = Trash2;
  readonly Plus = Plus;
  readonly Clipboard = Clipboard;
  readonly History = History;
  readonly TestTube = TestTube;
  readonly CheckCircle = CheckCircle;
  readonly Pen = Pencil;
  readonly Label = Tag;


  // pestañas
  tabs = [
    { key: 'muestras', label: 'Muestras' },
    { key: 'verde', label: 'Lotes Café Verde' },
    { key: 'tostado', label: 'Café Tostado' },
  ];

  activeTab: 'muestras' | 'verde' | 'tostado' = 'muestras';

  filterMuestra: FilterKey = 'sin-completar';
  filterTostado: FilterKey = 'no-enviados';
  filtersMuestras: { key: FilterKey; label: string }[] = [
    { key: 'todas', label: 'TODOS' },
    { key: 'sin-completar', label: 'SIN COMPLETAR' },
    { key: 'completadas', label: 'COMPLETADAS' }
  ];
  filtersTostado: { key: FilterKey; label: string }[] = [
    { key: 'todos', label: 'HISTORICO' },
    { key: 'enviados', label: 'LOTES ENVIADOS' },
    { key: 'no-enviados', label: 'LOTES DISPONIBLES' }
  ];

  // streams de datos
  muestras$!: Observable<Muestra[]>;

  lotes: Lote[] = [];
  lotesFiltrados: Lote[] = [];

  tostados: LoteTostado[] = [];
  tostadosFiltrados: LoteTostado[] = [];


  startDate: string = '';
  endDate: string = '';

  showAddMuestra = false;
  showAddLote = false;
  showReportLote = false;
  showBlendLote = false;
  showFichaTueste = false;
  showBlendTueste = false;
  showReportLoteTostado = false;
  showHistoricLote = false;
  showHistoricLoteTostado = false;
  showEditLote = false;

  // en InventoryPage
  filterTextMuestras = '';
  filterTextVerde = '';
  filterTextTostado = '';

  selectedLoteId = '';
  selectedLote!: Lote;
  selectedMuestraId = '';
  selectedTuesteId = '';
  

  select_obj = 'Muestra';

  usuarios: any;

  constructor(
    private muestraService: MuestraService,
    private loteService: LoteService,
    private loteTostadoService: LoteTostadoService,
    private userService: UserService,
    private uiService: UiService,
    private router: Router
  ) { }

  ngOnInit() {
    // 🔹 Recuperar tab guardado (si existe)
    const savedTab = localStorage.getItem('inventoryActiveTab') as InventoryTab | null;
    if (savedTab && ['muestras', 'verde', 'tostado'].includes(savedTab)) {
      this.activeTab = savedTab;
    } else {
      this.activeTab = 'muestras'; // valor por defecto
    }

    // 🔹 Cargar datos del tab actual
    if (this.activeTab === 'muestras') this.loadMuestras();
    else if (this.activeTab === 'verde') this.loadLotes();
    else if (this.activeTab === 'tostado') this.loadTostados();

    this.loadUsuarios();
    this.select_obj = this.activeTab === 'muestras' ? 'Muestra' : 'Lote';
  }


  openAdd() {
    if (this.activeTab === 'muestras') this.showAddMuestra = true;
    else if (this.activeTab === 'verde') this.showAddLote = true;
  }

  openBlendLote() {
    this.showBlendLote = true;
  }

  openBlendTueste() {
    this.showBlendTueste = true;
  }

  onMuestraCreated() {
    this.showAddMuestra = false;
    this.loadMuestras();
  }

  onLoteCreated() {
    this.showAddLote = false;
    this.loadLotes();
  }

  onLoteUpdated() {
    this.showEditLote = false;
    this.loadLotes();
  }

  onCreateBlend() {
    this.showBlendLote = false;
    this.loadLotes();
  }

  onCreateBlendTueste() {
    this.showBlendTueste = false;
    this.loadTostados();
  }

  onCompleteMuestra(m: Muestra) {
    this.muestraService.complete(m.id_muestra).subscribe({
      next: () => {
        this.uiService.alert('success', 'Éxito', 'Muestra marcada como completa');
        this.loadMuestras();
      }
    });
  }

  onReportLote(l: Lote) {
    this.loteService.getById(l.id_lote).subscribe(lote => {
      if (!lote || !lote.id_analisis) {
        this.uiService.alert('error', 'Error', 'El lote no tiene análisis asociado');
        return;
      } else {
        this.selectedLoteId = l.id_lote;
        this.showReportLote = true;
      }
    });
  }

  openHistoricLote(l: Lote) {
    this.selectedLoteId = l.id_lote;
    this.showHistoricLote = true;
  }

  openHistoricLoteTostado(t: LoteTostado) {
    this.selectedTuesteId = t.id_lote_tostado;
    this.showHistoricLoteTostado = true;
  }

  openEditLote(l: Lote) {
    this.showEditLote = true;
    this.selectedLoteId = l.id_lote;
  }

  openReportLoteTostado(l:LoteTostado){
    if(!l.id_analisis_rapido){
      this.uiService.alert('error', 'Error', 'El lote no tiene análisis asociado');
    }else{
      this.selectedTuesteId = l.id_lote_tostado;
      this.showReportLoteTostado = true;
    }
  }

  deleteLote(l: Lote) {
    this.uiService.confirm({
      title: 'Eliminar orden',
      message: `¿Estás seguro de que deseas eliminar el lote ${l.id_lote}?`,
      confirmText: 'Sí',
      cancelText: 'No'
    }).then(confirmed => {
      if (confirmed) {
        this.loteService.delete(l.id_lote).subscribe({
          next: () => {
            this.uiService.alert('success', 'Éxito', 'Lote eliminado correctamente');
            this.loadLotes();
          },
          error: (err) => {
            console.error(err);
            this.uiService.alert('error', 'Error', 'No se pudo eliminar el lote');
          }
        });
      }
    });
  }

  deleteLoteTostado(l: LoteTostado) {
    this.uiService.confirm({
      title: 'Eliminar orden',
      message: `¿Estás seguro de que deseas eliminar el lote tostado ${l.id_lote_tostado  }?`,
      confirmText: 'Sí',
      cancelText: 'No'
    }).then(confirmed => {
      if (confirmed) {
        this.loteTostadoService.delete(l.id_lote_tostado ).subscribe({
          next: () => {
            this.uiService.alert('success', 'Éxito', 'Lote eliminado correctamente');
            this.loadLotes();
          },
          error: (err) => {
            console.error(err);
            this.uiService.alert('error', 'Error', 'No se pudo eliminar el lote');
          }
        });
      }
    });
  }



  // BUSQUEDA DE MUESTRAS Y LOTES 
  aplicarFiltroMuestras() {
    this.muestras$ = this.muestraService.getAll().pipe(
      map(muestras => {
        if (!muestras) return [];
        let filtradas = muestras;

        // filtro por estado (igual que ya lo tienes)
        switch (this.filterMuestra) {
          case 'completadas': filtradas = filtradas.filter(m => m.completado); break;
          case 'sin-completar': filtradas = filtradas.filter(m => !m.completado); break;
        }

        // filtro por texto usando filterTextMuestras
        if (this.filterTextMuestras.trim() !== '') {
          const term = this.filterTextMuestras.toLowerCase();
          filtradas = filtradas.filter(m => {
            const user = this.usuarios?.find((u: User) => u.id_user === m.id_user);
            const nombreCliente = (user?.nombre_comercial || user?.nombre || '').toLowerCase();

            return (
              m.productor?.toLowerCase().includes(term) ||
              m.finca?.toLowerCase().includes(term) ||
              m.nombre_muestra?.toLowerCase().includes(term) ||
              m.distrito?.toLowerCase().includes(term) ||
              nombreCliente.includes(term)
            );
          });
        }
        return filtradas;
      })
    );
  }

  aplicarFiltroLotesVerde() {
    if (!this.lotes) return;

    if (this.filterTextVerde.trim() === '') {
      this.lotesFiltrados = this.lotes;
      return;
    }

    const term = this.filterTextVerde.toLowerCase();
    this.lotesFiltrados = this.lotes.filter(l => {
      const user = this.usuarios?.find((u: User) => u.id_user === l.id_user);
      const nombreCliente = (user?.nombre_comercial || user?.nombre || '').toLowerCase();

      return (
        l.id_lote.toLowerCase().includes(term) ||
        l.distrito?.toLowerCase().includes(term) ||
        l.productor?.toLowerCase().includes(term) ||
        l.variedades?.join(' ').toLowerCase().includes(term) ||
        l.clasificacion?.toLowerCase().includes(term) ||
        l.proceso?.toLowerCase().includes(term) ||
        nombreCliente.includes(term)
      );
    });
  }

  aplicarFiltroLotesTostados() {
    if (!this.tostados) return;

    let filtrados = this.tostados;

    // 🔹 Filtro por estado (según la opción seleccionada)
    switch (this.filterTostado) {
      case 'enviados':
        filtrados = filtrados.filter(t => !!t.entregado && t.peso === 0);
        break;
      case 'no-enviados':
        filtrados = filtrados.filter(t => !t.entregado || t.peso > 0);
        break;
      // 'todos' no filtra nada
    }

    // 🔹 Filtro por texto
    if (this.filterTextTostado.trim() !== '') {
      const term = this.filterTextTostado.toLowerCase();

      filtrados = filtrados.filter(t => {
        const user = this.usuarios?.find((u: User) => u.id_user === t.id_user);
        const nombreCliente = (user?.nombre_comercial || user?.nombre || '').toLowerCase();
        const loteVerde = this.lotes.find(l => l.id_lote === t.id_lote);

        return (
          t.id_lote_tostado?.toLowerCase().includes(term) ||
          t.perfil_tostado?.toLowerCase().includes(term) ||
          nombreCliente.includes(term) ||
          loteVerde?.productor?.toLowerCase().includes(term) ||
          loteVerde?.distrito?.toLowerCase().includes(term) ||
          loteVerde?.variedades.join(' ').toLowerCase().includes(term) ||
          loteVerde?.clasificacion?.toLowerCase().includes(term) ||
          loteVerde?.proceso.toLowerCase().includes(term) ||
          loteVerde?.id_lote.toLowerCase().includes(term)
        );
      });
    }

    this.tostadosFiltrados = filtrados;
  }


  getLotesCliente(lotes: Lote[]) {
    return lotes.filter(l => {
      const user = this.usuarios.find((u: User) => u.id_user === l.id_user);
      return user?.rol === 'cliente';
    });
  }

  getLotesAdmin(lotes: Lote[]) {
    return lotes.filter(l => {
      const user = this.usuarios.find((u: User) => u.id_user === l.id_user);
      return user?.rol === 'admin';
    });
  }

  loadMuestras() {
    this.aplicarFiltroMuestras();
    this.select_obj = 'Muestra'
  }

  loadUsuarios() {
    this.userService.getUsers().subscribe(users => {
      this.usuarios = users;
    });
  }

  onReportMuestra(m: Muestra) {
    this.muestraService.getById(m.id_muestra).subscribe(muestra => {
      console.log(muestra);
      if (!muestra || !muestra.id_analisis) {
        this.uiService.alert('error', 'Error', 'La muestra no tiene análisis asociado');
        return;
      } else {
        this.selectedMuestraId = muestra.id_muestra;
        this.showReportLote = true;
      }
    })
  }

  onFichaTueste(t: LoteTostado) {
    this.selectedTuesteId = t.id_lote_tostado;
    this.showFichaTueste = true;
  }

  onTabSelect(key: string) {
    this.activeTab = key as InventoryTab;

    localStorage.setItem('inventoryActiveTab', this.activeTab);

    if (key === 'muestras') this.loadMuestras();
    else if (key === 'verde') this.loadLotes();
    else if (key === 'tostado') this.loadTostados();
  }

  onDateChange() {
    if (!this.tostados) return;

    const desde = this.startDate ? new Date(this.startDate) : null;
    const hasta = this.endDate ? new Date(this.endDate) : null;

    this.tostadosFiltrados = this.tostados.filter(t => {
      const fecha = new Date(t.fecha_tostado);
      return (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
    });
  }

  loadLotes() {
    this.loteService.getAll().subscribe(lotes => {
      this.lotes = lotes;
      this.lotesFiltrados = lotes;
      this.aplicarFiltroLotesVerde();
    });
    this.select_obj = 'Lote'
  }

  loadTostados() {
    this.loteTostadoService.getAll().subscribe(tostados => {
      this.tostados = tostados;
      this.tostadosFiltrados = tostados;
      this.aplicarFiltroLotesTostados();
    });
  }

  onSearchChange() {
    this.loadMuestras();
    this.loadLotes();
    this.loadTostados();
  }

  onReportTueste(t: LoteTostado) {
    this.router.navigate(['/report-lote-tostado', t.id_lote_tostado]);
  }

  async exportStickerTostado(t: any) {
    const lote = t?.id_lote ?? '';
    const fecha = t?.fecha_tostado
      ? formatDate(new Date(t.fecha_tostado), 'dd/MM/yyyy', 'es-PE')
      : formatDate(new Date(), 'dd/MM/yyyy', 'es-PE');

    // 1) Obtener cliente antes de dibujar (tiene id_user en esta tabla)
    let cliente = '';
    try {
      const user = await firstValueFrom(this.userService.getUserById(t.id_user));
      cliente = user?.nombre_comercial || user?.nombre || '';
    } catch { /* fallback vacío */ }

    // 2) Canvas más grande para que la fecha no se corte (fecha a 36px)
    const W = 1400, H = 320, dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';

    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    // Fondo + borde
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    // Layout (sum = 1400). Amplié fecha a 260px y cliente bien ancho.
    const cols = [700, 440, 260]; // Lote, Cliente, Fecha
    const x = [20, 20 + cols[0], 20 + cols[0] + cols[1]];
    const yHeader = 70, yValue = 170;

    // Encabezados
    ctx.font = '600 26px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillStyle = '#111111';
    ['Lote', 'Cliente', 'Fecha'].forEach((h, i) => ctx.fillText(h, x[i], yHeader));

    // Línea divisoria
    ctx.beginPath();
    ctx.moveTo(20, yHeader + 16);
    ctx.lineTo(W - 20, yHeader + 16);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#999999';
    ctx.stroke();

    // Valores (36px). Lote/Cliente pueden achicarse para encajar; la fecha NO.
    const valueFont = '500 36px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    ctx.fillStyle = '#111111';

    const drawFit = (text: string, xi: number, maxW: number) => {
      let size = 36;
      ctx.font = valueFont;
      while (ctx.measureText(text).width > maxW && size > 12) {
        size -= 1;
        ctx.font = valueFont.replace(/\d+px/, size + 'px');
      }
      ctx.fillText(text, xi, yValue);
      ctx.font = valueFont; // reset para el siguiente
    };

    drawFit(String(lote), x[0], cols[0] - 30);
    drawFit(String(cliente), x[1], cols[1] - 30);

    // Fecha fija a 36px
    ctx.font = valueFont;
    ctx.fillText(String(fecha), x[2], yValue);

    // Descargar PNG
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `StickerTostado_${lote}_${formatDate(new Date(), 'yyyyMMdd_HHmm', 'es-PE')}.png`;
    a.click();
    a.remove();
  }

}
