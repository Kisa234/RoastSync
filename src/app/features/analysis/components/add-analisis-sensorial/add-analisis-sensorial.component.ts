import { AnalisisSensorialService } from './../../service/analisis-sensorial.service';
import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { X } from 'lucide-angular';
import { AnalisisSensorial } from '../../../../shared/models/analisis-sensorial';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { SensorialData, SensorialNotesComponent } from '../sensorial-notes/sensorial-notes.component';


@Component({
  selector: 'add-analisis-sensorial',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    SensorialNotesComponent
  ],
  templateUrl: './add-analisis-sensorial.component.html'
})
export class AddAnalisisSensorial implements OnInit, OnChanges {

  @Input() targetType: string = '';
  @Input() targetId: string = '';
  @Input() mode: string = 'Crear';
  @Input() initialData: Partial<AnalisisSensorial> = {};

  readonly X = X;

  form: Partial<AnalisisSensorial> = {
    fragancia_aroma: 6,
    sabor: 6,
    sabor_residual: 6,
    acidez: 6,
    cuerpo: 6,
    balance: 6,
    puntaje_catador: 6,
    taza_limpia: 10,
    uniformidad: 10,
    dulzor: 10,
    taza_defecto_ligero: 0,
    tazas_defecto_rechazo: 0,
    puntaje_taza: 0,
    comentario: ''
  };

  ngOnInit() {
    this.seedStorageIfNeeded();
    this.loadFromStorage();
    this.calculateScore();
  }

  private seedStorageIfNeeded() {
    const key = this.storageKey();
    const hasStored = !!localStorage.getItem(key);
    const hasData = this.initialData && Object.keys(this.initialData).length > 0;
    if (!hasStored && hasData) {
      localStorage.setItem(key, JSON.stringify(this.initialData));
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      (changes['targetType'] && !changes['targetType'].isFirstChange()) ||
      (changes['targetId'] && !changes['targetId'].isFirstChange()) ||
      (changes['mode'] && !changes['mode'].isFirstChange())
    ) {
      this.seedStorageIfNeeded();
      this.loadFromStorage();
    }
  }

  private storageKey(): string {
    return `${this.targetType.toUpperCase()}-${this.targetId}-SENSORIAL-${this.mode.toUpperCase()}`;
  }

  private loadFromStorage() {
    const key = this.storageKey();
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        this.form = JSON.parse(stored);
      } catch {
        // JSON inválido, ignorar
      }
    }
  }

  persist() {
    this.calculateScore();
    const key = this.storageKey();
    localStorage.setItem(key, JSON.stringify(this.form));

  }

  calculateScore() {
    this.form.puntaje_taza = ((
      this.form.fragancia_aroma! +
      this.form.sabor! +
      this.form.sabor_residual! +
      this.form.acidez! +
      this.form.cuerpo! +
      this.form.uniformidad! +
      this.form.balance! +
      this.form.taza_limpia! +
      this.form.dulzor! +
      this.form.puntaje_catador!
    ) - (this.form.taza_defecto_ligero! * 2) - (this.form.tazas_defecto_rechazo! * 4));
  }


  sensorialJson!: SensorialData;

  onSensorialData(data: SensorialData) {
    const lines: string[] = [];
    if (data.notas && data.notas.length > 0) {
      lines.push(`Notas a ${data.notas.join(', ')}`);
    }
    if (data.base && data.base.length > 0) {
      lines.push(`con base a ${data.base.join(', ')}`);
    }
    if (data.fondo && data.fondo.length > 0) {
      lines.push(`y con fondo a ${data.fondo.join(', ')}.`);
    }
    if (data.acidez !== undefined && data.acidez !== null && data.acidez !== '') {
      lines.push(`presenta una acidez ${data.acidez}`);
    }
    if (data.cuerpo !== undefined && data.cuerpo !== null && data.cuerpo !== '') {
      lines.push(`y un cuerpo ${data.cuerpo}`);
    }
    this.form.comentario = lines.join('\n');
    this.persist();
  }

}
