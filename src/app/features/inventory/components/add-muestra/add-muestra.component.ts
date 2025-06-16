import { Component, EventEmitter, Output, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { X, Check, ChevronDown } from 'lucide-angular';

import { MuestraService } from '../../service/muestra.service';
import { Muestra } from '../../../../shared/models/muestra';

@Component({
  selector: 'add-muestra',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    NgIf
  ],
  templateUrl: './add-muestra.component.html'
})
export class AddMuestraComponent {
  // icons
  readonly X = X;
  readonly Check = Check;
  readonly ChevronDown = ChevronDown;

  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<Muestra>();

  // Modelo
  model: Partial<Muestra> = {
    productor: '',
    finca: '',
    region: '',
    departamento: '',
    peso: 0,
    variedades: [],
    proceso: ''
  };

  // Listas de opciones
  variedadesArabica: string[] = [
    'Typica', 'Bourbon', 'Mundo Novo', 'Maragogipe', 'Caturra', 'Villa Sarchí',
    'Pacas', 'Catuaí', 'Geisha', 'Pacamara', 'Sarchimor', 'Catimor',
    'SL28', 'SL34', 'Castillo', 'Cenicafé 1', 'Tabi', 'Híbridos F1', 'Moka',
    'Jamaica Blue Mountain', 'Kona', 'Marshell', 'Sidra', 'Bourbon Amarillo',
    'Bourbon Rosado', 'Bourbon Enano', 'Caturra Amarillo', 'Papayo', 'Arara'
  ];
  procesos = ['Lavado', 'Natural', 'Honey'];

  // Dropdown Propio
  showVarDropdown = false;
  filterVar = '';

  @ViewChild('varietyContainer', { static: true }) varietyContainer!: ElementRef;


  toggleVarDropdown() {
    this.showVarDropdown = !this.showVarDropdown;
    if (this.showVarDropdown) {
      this.filterVar = '';
    }
  }

  @HostListener('document:click', ['$event.target'])
  closeVarDropdown(target: HTMLElement) {
    if (
      this.showVarDropdown &&
      !this.varietyContainer.nativeElement.contains(target)
    ) {
      this.showVarDropdown = false;
    }
  }

  // Retorna todas las opciones que coincidan con el filtro
  get filteredVariedades(): string[] {
    const q = this.filterVar.trim().toLowerCase();
    return this.variedadesArabica
      .filter(v => !q || v.toLowerCase().includes(q));
  }

  // Añade/quita al array
  onVarToggle(v: string) {
    const arr = this.model.variedades || [];
    this.model.variedades = arr.includes(v)
      ? arr.filter(x => x !== v)
      : [...arr, v];
  }

  onCancel() {
    this.close.emit();
  }

  onSave() {
    this.svc.create(this.model).subscribe(m => {
      this.create.emit(m);
      this.close.emit();
    });
  }

  constructor(private svc: MuestraService) { }
}
