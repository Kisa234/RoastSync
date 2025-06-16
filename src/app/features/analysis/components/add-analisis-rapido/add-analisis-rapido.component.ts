import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { X }           from 'lucide-angular';

@Component({
  selector: 'add-analisis-rapido',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './add-analisis-rapido.component.html'
})
export class AddAnalisisRapido implements OnInit, OnChanges {
  @Input() targetLabel: string = '';
  @Input() mode: string = 'Crear';
  @Output() saved = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  readonly X = X;

  form: {
    horneado: boolean;
    humo: boolean;
    uniforme: boolean;
    verde: boolean;
    arrebatado: boolean;
    oscuro: boolean;
    comentario: string;
  } = {
    horneado: false,
    humo: false,
    uniforme: false,
    verde: false,
    arrebatado: false,
    oscuro: false,
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
    return `${type?.toUpperCase() || 'ITEM'}-${id || 'UNKNOWN'}-RAPIDO-${this.mode.toUpperCase()}`;
  }

  private loadFromStorage() {

    
    const key = this.storageKey();
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        this.form = JSON.parse(stored);
      } catch {
        // si JSON inválido, ignoramos
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
