import { Component } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Eye } from 'lucide-angular';
import { AddEnvioComponent } from '../../components/add-envio/add-envio.component';
import { FichaEnvioComponent } from '../../components/ficha-envio/ficha-envio.component';
import { Envio } from '../../../../shared/models/envio';
import { EnviosService } from '../../service/envios.service';
import { UserNamePipe } from "../../../../shared/pipes/user-name-pipe.pipe";



@Component({
  selector: 'envio-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    LucideAngularModule,
    AddEnvioComponent,
    FichaEnvioComponent,
    UserNamePipe
  ],
  templateUrl: './envio.page.component.html',
})
export class EnvioPageComponent {
  readonly Plus = Plus;
  readonly Eye = Eye;

  envios: Envio[] = [];

  showAddEnvio = false;
  showFichaEnvio = false;
  selectedEnvioId = '';

  // filtros
  startDate = '';
  endDate = '';

  constructor(private enviosSvc: EnviosService) { }

  ngOnInit() {
    this.resetRange();       // setea últimos 30 días
    this.fetchEnvios();      // carga inicial
  }

  // Helpers de fecha
  private toISO(d: Date) {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  resetRange() {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    this.startDate = this.toISO(start);
    this.endDate = this.toISO(end);
    this.fetchEnvios();
  }

  onFilterChange() {
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      this.endDate = this.startDate;
    }
    this.fetchEnvios();
  }

  private fetchEnvios() {
    this.enviosSvc.getEnviosByFechaRange(this.startDate, this.endDate)
      .subscribe(list => this.envios = list || []);
  }

  openAddEnvio() {
    this.showAddEnvio = true;
  }

  onEnvioCreated(_: any) {
    this.showAddEnvio = false;
    this.fetchEnvios();
  }

  view(e: Envio) {
    this.selectedEnvioId = e.id_envio;
    this.showFichaEnvio = true;
  }

  trackByEnvioId = (_: number, e: Envio) => e.id_envio;



}
