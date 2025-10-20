import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { UserService } from '../../../users/service/users-service.service';
import { LoteTostado } from '../../../../shared/models/lote-tostado';
import { User } from '../../../../shared/models/user';
import { formatDate } from '@angular/common';
import { LoteTostadoService } from '../../../inventory/service/lote-tostado.service';

@Component({
  selector: 'lotes-tostados',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf],
  templateUrl: './lotes-tostados.component.html',
  styles: ``
})
export class LotesTostadosDashboardComponent implements OnInit {
  lotesTienda: LoteTostado[] = [];
  lotesClientes: LoteTostado[] = [];
  usuarios: User[] = [];

  // Variables configurables (puedes cambiarlas luego)
  diasUrgenciaClientes = 5;
  diasUrgenciaTienda = 10;

  constructor(
    private loteTostadoService: LoteTostadoService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.userService.getUsers().subscribe(users => {
      this.usuarios = users;

      this.loteTostadoService.getAll().subscribe(lotes => {
        // Filtrar solo los que tienen peso > 0
        const lotesValidos = lotes.filter(l => l.peso && l.peso > 0);

        // Ordenar de más antiguo a más nuevo
        lotesValidos.sort(
          (a, b) => new Date(a.fecha_tostado).getTime() - new Date(b.fecha_tostado).getTime()
        );

        // Separar por tipo de usuario
        this.lotesTienda = lotesValidos.filter(l => this.getUserRol(l.id_user) === 'admin');
        this.lotesClientes = lotesValidos.filter(l => this.getUserRol(l.id_user) === 'cliente');
      });
    });
  }


  getDiasDesdeTostado(fechaTostado: Date): number {
    const hoy = new Date();
    const diffMs = hoy.getTime() - new Date(fechaTostado).getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }



  getUserRol(id_user: string): string {
    const user = this.usuarios.find(u => u.id_user === id_user);
    return user?.rol || 'desconocido';
  }

  getUserName(id_user: string): string {
    const user = this.usuarios.find(u => u.id_user === id_user);
    return user?.nombre_comercial || user?.nombre || 'Sin nombre';
  }

  // Calcula el color según los días desde creación
  getUrgenciaColor(fecha: Date, rol: string): string {
    const diffDias = this.getDiasDesdeTostado(fecha);
    const maxDias = rol === 'cliente' ? this.diasUrgenciaClientes : this.diasUrgenciaTienda;
    const ratio = Math.min(diffDias / maxDias, 1);

    const red = Math.floor(255 * ratio);
    const green = Math.floor(255 * (1 - ratio * 0.5));
    const blue = Math.floor(255 * (1 - ratio * 0.5));

    return `rgba(${red}, ${green}, ${blue}, 0.2)`;
  }


  formatFecha(fecha: string | Date) {
    return formatDate(fecha, 'dd/MM/yyyy', 'es-PE');
  }

}
