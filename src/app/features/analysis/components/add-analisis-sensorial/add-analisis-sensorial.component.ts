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
  @Input() targetLabel: string = '';
  @Input() mode: string = 'Crear';
  @Output() saved = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

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
    this.loadFromStorage();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['targetLabel'] || changes['mode']) {
      this.loadFromStorage();
    }
  }

  private storageKey(): string {
    const [type, id] = this.targetLabel.split(' ');
    return `${type?.toUpperCase() || 'ITEM'}-${id || 'UNKNOWN'}-SENSORIAL-${this.mode.toUpperCase()}`;
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

  onClose() {
    this.close.emit();
  }
}
