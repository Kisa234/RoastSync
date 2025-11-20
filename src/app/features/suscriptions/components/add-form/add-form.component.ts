import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BoxTemplateService } from '../../service/box-template.service';
import { BoxOpcionService } from '../../service/box-opcion.service';
import { LoteService } from '../../../inventory/service/lote.service';
import { UserService } from '../../../users/service/users-service.service';
import { Lote } from '../../../../shared/models/lote';
import { forkJoin, map, switchMap } from 'rxjs';

@Component({
  selector: 'box-add-form',
  templateUrl: './add-form.component.html',
  imports: [CommonModule, FormsModule]
})
export class AddFormComponent implements OnInit {

  @Output() closes = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

  // FORM PRINCIPAL
  form: any = {
    nombre: '',
    cafe_fijo_1: '',
    cafe_fijo_2: '',
    tueste_fijo_1: [],
    tueste_fijo_2: [],
    descripcion: '',
    activo: true
  };

  lotes: Lote[] = [];

  cafesSeleccionados: { id_lote: string, tuestes: string[] }[] = [];
  cafeSeleccionado: string = '';

  loading = false;

  constructor(
    private templateSvc: BoxTemplateService,
    private opcionSvc: BoxOpcionService,
    private loteSvc: LoteService,
    private userSvc: UserService
  ) { }

  ngOnInit() {
    this.form.nombre = this.generateName();
    this.loadLotes();
  }

  generateName() {
    const meses = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    return `BOX - ${meses[new Date().getMonth()]}`;
  }

  // CORREGIDO: carga lotes de admins sin subscribes anidados
  loadLotes() {
    this.loteSvc.getAll()
      .pipe(
        switchMap(lotes =>
          forkJoin(
            lotes.map(l =>
              this.userSvc.getUserById(l.id_user!).pipe(
                map(user => ({ lote: l, esAdmin: user.rol === 'admin' }))
              )
            )
          )
        )
      )
      .subscribe({
        next: (result) => {
          this.lotes = result.filter(r => r.esAdmin).map(r => r.lote);
        },
        error: err => console.error('Error loading lotes:', err)
      });
  }

  agregarCafeOpcion() {
    if (!this.cafeSeleccionado) return;

    if (this.cafesSeleccionados.some(c => c.id_lote === this.cafeSeleccionado)) return;

    this.cafesSeleccionados.push({
      id_lote: this.cafeSeleccionado,
      tuestes: []
    });

    this.cafeSeleccionado = '';
  }

  eliminarCafeOpcion(index: number) {
    this.cafesSeleccionados.splice(index, 1);
  }

  save() {
    if (!this.form.cafe_fijo_1 || !this.form.cafe_fijo_2) return;

    this.loading = true;

    const payload = {
      ...this.form,
      opciones: this.cafesSeleccionados.map(op => ({
        id_cafe: op.id_lote,
        tuestes: op.tuestes
      }))
    };


    this.templateSvc.create(payload).subscribe({
      next: (template) => {
        this.saved.emit(template);
        this.closes.emit();
      },
      error: err => {
        console.error('Error al crear template:', err);
        this.loading = false;
      }
    });
  }


  getLoteInfo(id_lote: string) {
    return this.lotes.find(l => l.id_lote === id_lote);
  }

  close() {
    this.closes.emit();
  }

  toggleTueste(array: string[], value: string) {
    const index = array.indexOf(value);
    if (index >= 0) array.splice(index, 1);
    else array.push(value);
  }
}
