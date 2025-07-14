import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { AnalisisDefectos } from '../../../../shared/models/analisis-defectos';
import { LucideAngularModule,X,ChevronDown } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'add-analisis-defectos',
  imports: [CommonModule, FormsModule, LucideAngularModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './add-analisis-defectos.component.html',
  styles: ``
})
export class AddAnalisisDefectos {
  @Input() targetType: string = '';
  @Input() targetId: string = '';
  @Input() mode: string = 'Crear';
  @Input() initialData: Partial<AnalisisDefectos> = {};
  @Output() save = new EventEmitter<AnalisisDefectos>();

  readonly X = X;
  readonly ChevronDown = ChevronDown;

  form: Partial<AnalisisDefectos> = {
    grano_negro: 0,
    grano_agrio: 0,
    grano_con_hongos: 0,
    cereza_seca: 0,
    materia_estrana: 0,
    broca_severa: 0,
    negro_parcial: 0,
    agrio_parcial: 0,
    pergamino: 0,
    flotadores: 0,
    inmaduro: 0,
    averanado: 0,
    conchas: 0,
    cascara_pulpa_seca: 0,
    partido_mordido_cortado: 0,
    broca_leva: 0,
    grado: '',
  };

  ngOnInit() {
    this.seedStorageIfNeeded();
    this.loadFromStorage();
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
    return `${this.targetType.toUpperCase()}-${this.targetId}-DEFECTOS-${this.mode.toUpperCase()}`;
  }

  private seedStorageIfNeeded() {
    const key = this.storageKey();
    const hasStored = !!localStorage.getItem(key);
    const hasData = this.initialData && Object.keys(this.initialData).length > 0;
    if (!hasStored && hasData) {
      localStorage.setItem(key, JSON.stringify(this.initialData));
    }
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(this.storageKey());
    if (stored) {
      try { this.form = JSON.parse(stored); } catch { }
    }
  }

  persist() {
    localStorage.setItem(this.storageKey(), JSON.stringify(this.form));
  }

  onSave() {
    const payload = { ...this.form } as AnalisisDefectos;
    this.save.emit(payload);
  }
  
}
