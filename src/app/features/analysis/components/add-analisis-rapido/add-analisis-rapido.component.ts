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
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatCheckboxModule} from '@angular/material/checkbox';

@Component({
  selector: 'add-analisis-rapido',
  standalone: true,
  imports: [ CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,MatCheckboxModule ],
  templateUrl: './add-analisis-rapido.component.html'
})
export class AddAnalisisRapido implements OnInit, OnChanges {
  @Input() targetType: string = '';
  @Input() targetId: string = '';
  @Input() mode: string = 'Crear';
  @Input() initialData: Partial<AnalisisRapido> = {};
  

  readonly X = X;

  form: Partial<AnalisisRapido> = {
    fragancia: '',
    aroma: '',
    floral: false,
    afrutado: false,
    bayas: false,
    frutos_secos: false,
    citricos: false,
    acido_fermentado: false,
    acido: false,
    fermentado: false,
    verde_vegetal: false,
    otros: false,
    quimico: false,
    rancio: false,
    tierra: false,
    papel: false,
    tostado: false,
    nueces_cacao: false,
    nueces: false,
    cocoa: false,
    especias: false,
    dulce: false,
    vainilla: false,
    azucar_morena: false,
    comentario: '',
  }

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
