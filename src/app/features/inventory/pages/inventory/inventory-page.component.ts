import { Component } from '@angular/core';
import { AsyncPipe, CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { Search, Eye, Edit2, Trash2, Clipboard } from 'lucide-angular';
import { map, Observable } from 'rxjs';
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



type InventoryTab = 'muestras' | 'verde' | 'tostado';

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
    FichaTuesteComponent,
    BlendLoteComponent,
    FormsModule,
    BlendTueste,
    UserNamePipe
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


  // pestañas
  tabs = [
    { key: 'muestras', label: 'Muestras' },
    { key: 'verde', label: 'Lotes Café Verde' },
    { key: 'tostado', label: 'Café Tostado' },
  ];
  activeTab: 'muestras' | 'verde' | 'tostado' = 'muestras';

  // streams de datos
  muestras$!: Observable<Muestra[]>;
  lotes$!: Observable<Lote[]>;


  tostados$!: Observable<LoteTostado[]>;
  filteredTostados: LoteTostado[] = [];
  startDate: string = '';
  endDate: string = '';

  showAddMuestra = false;
  showAddLote = false;
  showReportLote = false;
  showBlendLote = false;
  showFichaTueste = false;
  showBlendTueste = false;

  filterText = '';
  selectedLoteId = '';
  selectedMuestraId = '';
  selectedTuesteId = '';

  usuarios: any;

  constructor(
    private muestraService: MuestraService,
    private loteService: LoteService,
    private tostService: LoteTostadoService,
    private userService: UserService,
    private uiService: UiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadMuestras();
    this.loadUsuarios();
    this.tostados$ = this.tostService.getAll();
    this.tostados$.subscribe(list => this.filteredTostados = list);
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
  onCreateBlend() {
    this.showBlendLote = false;
    this.loadLotes();
  }

  onCreateBlendTueste() {
    this.showBlendTueste = false;
    this.loadTostados();
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
    if (key === 'muestras') this.loadMuestras();
    else if (key === 'verde') this.loadLotes();
    else if (key === 'tostado') this.loadTostados();
  }

  onDateChange() {
    this.tostados$.pipe(
      map(list =>
        list.filter(t => {
          const fecha = new Date(t.fecha_tostado);
          const desde = this.startDate ? new Date(this.startDate) : null;
          const hasta = this.endDate ? new Date(this.endDate) : null;
          return (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
        })
      )
    ).subscribe(filtered => this.filteredTostados = filtered);
  }

  loadMuestras() {
    this.muestras$ = this.muestraService.getAll();
  }

  loadLotes() {
    this.lotes$ = this.loteService.getAll();
  }

  loadTostados() {
    this.tostados$ = this.tostService.getAll();
  }

  onSearchChange() {
    this.loadMuestras();
  }

  onReportTueste(t: LoteTostado) {
    this.router.navigate(['/report-lote-tostado', t.id_lote_tostado]);
  }

}
