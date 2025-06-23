import { AnalisisSensorialService } from './../../service/analisis-sensorial.service';
import {
  Component, EventEmitter, Input, Output,
  OnInit, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { X }           from 'lucide-angular';
import { AnalisisSensorial } from '../../../../shared/models/analisis-sensorial';

@Component({
  selector: 'add-analisis-sensorial',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './add-analisis-sensorial.component.html'
})
export class AddAnalisisSensorial implements OnInit, OnChanges {

  

  @Input() targetType: string = '';
  @Input() targetId: string = '';
  @Input() mode: string = 'Crear';
  @Input() initialData: Partial<AnalisisSensorial> = {};

  readonly X = X;

  form: Partial<AnalisisSensorial> = {
    fragancia_aroma: 0,
    sabor: 0,
    sabor_residual: 0,
    acidez: 0,
    cuerpo: 0,
    uniformidad: 0,
    balance: 0,
    taza_limpia: 0,
    dulzor: 0,
    puntaje_catador: 0,
    taza_defecto_ligero: 0,
    tazas_defecto_rechazo: 0,
    puntaje_taza: 0,
    comentario: ''
  };

  ngOnInit() {
    this.seedStorageIfNeeded();
    this.loadFromStorage();
  }

  private seedStorageIfNeeded() {
    const key       = this.storageKey();
    const hasStored = !!localStorage.getItem(key);
    const hasData   = this.initialData && Object.keys(this.initialData).length > 0;
    if (!hasStored && hasData) {
      localStorage.setItem(key, JSON.stringify(this.initialData));
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      (changes['targetType'] && !changes['targetType'].isFirstChange()) ||
      (changes['targetId']   && !changes['targetId'].isFirstChange())   ||
      (changes['mode']       && !changes['mode'].isFirstChange())
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
    const key = this.storageKey();
    localStorage.setItem(key, JSON.stringify(this.form));
    
  }

 
}
