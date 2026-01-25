import { Component } from '@angular/core';
import { CommonModule, AsyncPipe, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Eye, CheckCircle, Plus } from 'lucide-angular';
import { Observable, map } from 'rxjs';
import { AddMuestraComponent } from '../../../components/add-muestra/add-muestra.component';
import { ReportLoteComponent } from '../../../../../shared/components/report-lote/report-lote.component';
import { UserNamePipe } from '../../../../../shared/pipes/user-name-pipe.pipe';
import { Muestra } from '../../../../../shared/models/muestra';
import { MuestraService } from '../../../service/muestra.service';
import { UserService } from '../../../../users/service/users-service.service';
import { UiService } from '../../../../../shared/services/ui.service';
import { User } from '../../../../../shared/models/user';


type FilterKey = 'todas' | 'sin-completar' | 'completadas';

@Component({
  selector: 'muestras-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AsyncPipe,
    NgIf,
    NgFor,
    LucideAngularModule,
    AddMuestraComponent,
    ReportLoteComponent,
    UserNamePipe
  ],

  templateUrl: './muestras.component.html'
})
export class MuestrasComponent {

  // icons
  readonly Search = Search;
  readonly Eye = Eye;
  readonly CheckCircle = CheckCircle;
  readonly Plus = Plus;

  muestras$!: Observable<Muestra[]>;

  filterTextMuestras = '';
  filterMuestra: FilterKey = 'sin-completar';

  filtersMuestras = [
    { key: 'todas', label: 'TODOS' },
    { key: 'sin-completar', label: 'SIN COMPLETAR' },
    { key: 'completadas', label: 'COMPLETADAS' }
  ];

  showAddMuestra = false;
  showReport = false;
  selectedMuestraId = '';

  usuarios: User[] = [];

  constructor(
    private muestraService: MuestraService,
    private userService: UserService,
    private uiService: UiService
  ) { }

  ngOnInit() {
    this.loadUsuarios();
    this.loadMuestras();
  }

  loadUsuarios() {
    this.userService.getUsers().subscribe(users => {
      this.usuarios = users;
    });
  }

  loadMuestras() {
    this.muestras$ = this.muestraService.getAll().pipe(
      map(muestras => {
        let filtradas = muestras;

        switch (this.filterMuestra) {
          case 'completadas':
            filtradas = filtradas.filter(m => m.completado);
            break;
          case 'sin-completar':
            filtradas = filtradas.filter(m => !m.completado);
            break;
        }

        if (this.filterTextMuestras.trim()) {
          const term = this.filterTextMuestras.toLowerCase();
          filtradas = filtradas.filter(m => {
            const user = this.usuarios.find(u => u.id_user === m.id_user);
            const cliente = (user?.nombre_comercial || user?.nombre || '').toLowerCase();

            return (
              m.nombre_muestra?.toLowerCase().includes(term) ||
              m.productor?.toLowerCase().includes(term) ||
              m.finca?.toLowerCase().includes(term) ||
              m.distrito?.toLowerCase().includes(term) ||
              cliente.includes(term)
            );
          });
        }

        return filtradas;
      })
    );
  }

  aplicarFiltro(key: string) {
    this.filterMuestra = key as FilterKey;
    this.loadMuestras();
  }


  onSearchChange() {
    this.loadMuestras();
  }

  onComplete(m: Muestra) {
    this.muestraService.complete(m.id_muestra).subscribe(() => {
      this.uiService.alert('success', 'Éxito', 'Muestra marcada como completa');
      this.loadMuestras();
    });
  }

  onReport(m: Muestra) {
    this.muestraService.getById(m.id_muestra).subscribe(muestra => {
      if (!muestra?.id_analisis) {
        this.uiService.alert('error', 'Error', 'La muestra no tiene análisis asociado');
        return;
      }
      this.selectedMuestraId = m.id_muestra;
      this.showReport = true;
    });
  }

  onCreated() {
    this.showAddMuestra = false;
    this.loadMuestras();
  }
}
