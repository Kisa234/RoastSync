import { Component } from '@angular/core';
import { CommonModule, AsyncPipe, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Eye, CheckCircle, Plus } from 'lucide-angular';
import { Observable, map } from 'rxjs';
import { AddMuestraComponent } from '../components/add-muestra/add-muestra.component';
import { ReportLoteComponent } from '../../../../shared/components/report-lote/report-lote.component';
import { UserNamePipe } from '../../../../shared/pipes/user-name-pipe.pipe';
import { User } from '../../../../shared/models/user';
import { UserService } from '../../../users/service/users-service.service';
import { UiService } from '../../../../shared/services/ui.service';
import { MuestraService } from '../service/muestra.service';
import { MuestraConInventario } from '../../../../shared/models/muestra';
import { AddInventoryMuestraComponent } from "../components/add-inventory-muestra/add-inventory-muestra.component";

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
    UserNamePipe,
    AddInventoryMuestraComponent
],
  templateUrl: './muestras.component.html'
})
export class MuestrasComponent {

  readonly Search = Search;
  readonly Eye = Eye;
  readonly CheckCircle = CheckCircle;
  readonly Plus = Plus;

  muestras$!: Observable<MuestraConInventario[]>;

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
  selectedMuestra: MuestraConInventario | null = null;
  showAsignarInventarioModal = false;


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
    this.muestras$ = this.muestraService.getMuestrasConInventario().pipe(
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

            const almacenes = (m.inventarioMuestras || [])
              .map(inv => inv.almacen?.nombre?.toLowerCase() || '')
              .join(' ');

            return (
              m.nombre_muestra?.toLowerCase().includes(term) ||
              m.productor?.toLowerCase().includes(term) ||
              m.finca?.toLowerCase().includes(term) ||
              m.distrito?.toLowerCase().includes(term) ||
              cliente.includes(term) ||
              almacenes.includes(term)
            );
          });
        }
        console.log(filtradas);
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

  openAsignarInventarioMuestra(muestra: MuestraConInventario): void {
    this.selectedMuestra = muestra;
    this.showAsignarInventarioModal = true;
  }

  closeAsignarInventarioMuestra(): void {
    this.selectedMuestra = null;
    this.showAsignarInventarioModal = false;
  }

  onInventarioMuestraCreated(): void {
    this.closeAsignarInventarioMuestra();
    this.loadMuestras();
  }

  onComplete(m: MuestraConInventario) {
    this.muestraService.complete(m.id_muestra).subscribe(() => {
      this.uiService.alert('success', 'Éxito', 'Muestra marcada como completa');
      this.loadMuestras();
    });
  }

  onReport(m: MuestraConInventario) {
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

  getVariedadesArray(variedades: string | string[]): string[] {
    if (Array.isArray(variedades)) return variedades;
    if (!variedades) return [];

    return variedades
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);
  }
}