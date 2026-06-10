import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { BalonGasService } from '../../service/balon-gas.service';
import { BalonGas } from '../../../../shared/models/balon-gas';
import { AddBalonGasComponent } from '../../components/add-balon-gas/add-balon-gas.component';

@Component({
  selector: 'app-balon-gas',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, AddBalonGasComponent],
  templateUrl: './balon-gas.component.html',
  styles: [':host { display: block; }']
})
export class BalonesGasComponent implements OnInit {

  readonly Plus = Plus;

  balones: BalonGas[] = [];
  loading = false;
  showModal = false;

  constructor(private balonGasSvc: BalonGasService) {}

  ngOnInit(): void {
    this.cargarBalones();
  }

  cargarBalones(): void {
    this.loading = true;
    this.balonGasSvc.getAll().subscribe({
      next: b => { this.balones = b; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onCreated(): void {
    this.showModal = false;
    this.cargarBalones();
  }

  formatFecha(fecha: string | Date | undefined): string {
    if (!fecha) return '—';
    return format(new Date(fecha), 'dd/MM/yyyy', { locale: es });
  }

  badgeEstado(estado: string): string {
    switch (estado) {
      case 'EN_USO':     return 'bg-green-50 text-green-700';
      case 'DISPONIBLE': return 'bg-blue-50 text-blue-700';
      case 'FINALIZADO': return 'bg-gray-100 text-gray-500';
      default:           return 'bg-gray-100 text-gray-500';
    }
  }

  labelEstado(estado: string): string {
    switch (estado) {
      case 'EN_USO':     return 'En uso';
      case 'DISPONIBLE': return 'Disponible';
      case 'FINALIZADO': return 'Finalizado';
      default:           return estado;
    }
  }
}