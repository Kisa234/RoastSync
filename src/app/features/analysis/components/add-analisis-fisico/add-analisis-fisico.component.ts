import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { X, ChevronDown, LucideAngularModule} from 'lucide-angular';
import { AnalisisFisico } from '../../../../shared/models/analisis-fisico';

@Component({
  selector: 'add-analisis-fisico',
  standalone: true,
  imports: [CommonModule, FormsModule,LucideAngularModule],
  templateUrl: './add-analisis-fisico.component.html'
})
export class AddAnalisisFisico implements OnInit, OnChanges {
  @Input() targetLabel: string = '';
  @Input() mode: string = 'Crear';
  @Output() saved = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  readonly X = X;
  readonly ChevronDown = ChevronDown;

  form: Partial<AnalisisFisico> = {
    peso_muestra: 0,
    peso_pergamino: 0,
    wa: 0,
    temperatura_wa: 0,
    humedad: 0,
    temperatura_humedad: 0,
    densidad: 0,
    color_grano_verde: '',
    olor: '',
    superior_malla_18: 0,
    superior_malla_16: 0,
    superior_malla_14: 0,
    menor_malla_16: 0,
    peso_defectos: 0,
    quaquers: 0,
    peso_muestra_tostada: 0,
    desarrollo: 0,
    pocentaje_caramelizcacion: 0,
    c_desarrollo: 0,
    grado: '',
    comentario: '',
    defectos_primarios: [],
    defectos_secundarios: []
  };

  primOptions = [
    'Grano negro completo', 'Grano negro parcial',
    'Grano agrio completo','Grano agrio parcial',
    'Cereza seca','Pergamino',
    'Piedra','Palo'
  ];
  secOptions = [
    'Inmaduro','Mordido por insecto','Caracol',
    'Decolorado','Cáscara','Quebrado',
    'Malformado','Oxidado','Daño por agua'
  ];

  showPrimDropdown = false;
  showSecDropdown  = false;
  filterPrim = '';
  filterSec  = '';

  @ViewChild('primContainer') primContainer!: ElementRef;
  @ViewChild('secContainer')  secContainer!: ElementRef;

  // getters para listas filtradas
  get filteredPrimOptions() {
    const f = this.filterPrim.toLowerCase();
    return this.primOptions.filter(o => o.toLowerCase().includes(f));
  }
  get filteredSecOptions() {
    const f = this.filterSec.toLowerCase();
    return this.secOptions.filter(o => o.toLowerCase().includes(f));
  }

  togglePrimDropdown() { this.showPrimDropdown = !this.showPrimDropdown; }
  toggleSecDropdown()  { this.showSecDropdown  = !this.showSecDropdown; }

  onTogglePrim(option: string) {
    const arr = this.form.defectos_primarios || [];
    this.form.defectos_primarios = arr.includes(option)
      ? arr.filter(x => x !== option)
      : [...arr, option];
    this.persist();
  }

  onToggleSec(option: string) {
    const arr = this.form.defectos_secundarios || [];
    this.form.defectos_secundarios = arr.includes(option)
      ? arr.filter(x => x !== option)
      : [...arr, option];
    this.persist();
  }

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
    return `${type?.toUpperCase() || 'ITEM'}-${id || 'UNKNOWN'}-FISICO-${this.mode.toUpperCase()}`;
  }

  private loadFromStorage() {
    const key = this.storageKey();
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        this.form = JSON.parse(stored);
      } catch {
        // if invalid JSON, ignore
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
