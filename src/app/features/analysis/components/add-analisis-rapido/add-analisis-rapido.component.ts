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
import { AnalisisRapido } from '../../../../shared/models/analisis-rapido';

@Component({
  selector: 'add-analisis-rapido',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './add-analisis-rapido.component.html'
})
export class AddAnalisisRapido implements OnInit, OnChanges {
  @Input() targetType: string = '';
  @Input() targetId: string = '';
  @Input() mode: string = 'Crear';
  @Input() initialData: Partial<AnalisisRapido> = {};
  

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
    this.seedStorageIfNeeded();
    this.loadFromStorage();
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

   private seedStorageIfNeeded() {
    const key       = this.storageKey();
    const hasStored = !!localStorage.getItem(key);
    const hasData   = this.initialData && Object.keys(this.initialData).length > 0;
    if (!hasStored && hasData) {
      localStorage.setItem(key, JSON.stringify(this.initialData));
    }
  }


  private storageKey(): string {   
    return `${this.targetType.toUpperCase()}-${this.targetId}-RAPIDO-${this.mode.toUpperCase()}`;
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

  
}
