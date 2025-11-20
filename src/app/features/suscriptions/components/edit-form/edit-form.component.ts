import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BoxTemplateService } from '../../service/box-template.service';
import { BoxOpcionService } from '../../service/box-opcion.service';
import { LoteService } from '../../../inventory/service/lote.service';
import { UserService } from '../../../users/service/users-service.service';
import { Lote } from '../../../../shared/models/lote';
import { forkJoin, map, switchMap } from 'rxjs';

@Component({
  selector: 'box-edit-form',
  templateUrl: './edit-form.component.html',
  imports: [CommonModule, FormsModule],
})
export class EditFormComponent implements OnInit {

  @Input() template!: any;        // Template recibido desde el padre
  @Output() closes = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

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
  cafesSeleccionados: { id_cafe: string, tuestes: string[] }[] = [];
  cafeSeleccionado: string = '';

  loading = false;

  constructor(
    private templateSvc: BoxTemplateService,
    private opcionSvc: BoxOpcionService,
    private loteSvc: LoteService,
    private userSvc: UserService
  ) { }

  ngOnInit() {
    this.loadLotes();
    this.loadData();
  }

  loadData() {
    // Llenar form con datos del template
    this.form = {
      nombre: this.template.nombre,
      cafe_fijo_1: this.template.cafe_fijo_1,
      cafe_fijo_2: this.template.cafe_fijo_2,
      tueste_fijo_1: [...this.template.tueste_fijo_1],
      tueste_fijo_2: [...this.template.tueste_fijo_2],
      descripcion: this.template.descripcion || '',
      activo: this.template.activo
    };

    // Llenar opciones existentes
    this.cafesSeleccionados = this.template.opciones?.map((o: any) => ({
      id_cafe: o.id_cafe,
      tuestes: [...o.tuestes]
    })) ?? [];
  }

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

    if (this.cafesSeleccionados.some(c => c.id_cafe === this.cafeSeleccionado)) return;

    this.cafesSeleccionados.push({
      id_cafe: this.cafeSeleccionado,
      tuestes: []
    });
    this.cafeSeleccionado = '';
  }

  eliminarCafeOpcion(i: number) {
    this.cafesSeleccionados.splice(i, 1);
  }

  save() {
    this.loading = true;

    const payload = {
      ...this.form,
      opciones: this.cafesSeleccionados
    };

    console.log('Payload to update:', payload);

    this.templateSvc.update(this.template.id_box_template, payload).subscribe({
      next: (updated) => {
        this.saved.emit(updated);
        this.close();
      },
      error: () => (this.loading = false)
    });
  }

  getLoteInfo(id: string) {
    return this.lotes.find(l => l.id_lote === id);
  }

  toggleTueste(array: string[], value: string) {
    const idx = array.indexOf(value);
    idx >= 0 ? array.splice(idx, 1) : array.push(value);
  }

  close() {
    this.closes.emit();
  }
}
