import {  Component,  EventEmitter,  HostListener,  ElementRef,  Output,  OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoffeeFlavors, ICoffeeFlavor } from '../../../../shared/models/rueda-sabores';

export interface SensorialData {
  notas: string[];
  base: string[];
  fondo: string[];
  acidez: string;
  cuerpo: string;
}

@Component({
  selector: 'app-sensorial-notes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './sensorial-notes.component.html'
})
export class SensorialNotesComponent implements OnInit {
  @Output() sensorialData = new EventEmitter<SensorialData>();

  form: SensorialData = {
    notas: [],
    base: [],
    fondo: [],
    acidez: '',
    cuerpo: ''
  };

  flavorOptions: string[] = [];
  acidityOptions = [
    'neutra','leve','suave','melosa','vinoza',
    'brillante','jugosa','agrio','acre'
  ];
  bodyOptions = [
    'acuoso','liviano','suave','terso','sedoso',
    'cremoso','oleoso','untuoso','áspero','arenoso','grumoso'
  ];

  notasOpen   = false;
  baseOpen    = false;
  fondoOpen   = false;

  constructor(private elRef: ElementRef) {}

  ngOnInit() {
    this.flavorOptions = this.flattenFlavors(CoffeeFlavors);
  }

  private flattenFlavors(arr: ICoffeeFlavor[]): string[] {
    return arr.reduce<string[]>((acc, cur) => {
      acc.push(cur.name.toString());
      if (cur.children) acc.push(...this.flattenFlavors(cur.children));
      return acc;
    }, []);
  }

  // Notas
  toggleNota(opt: string) {
    const i = this.form.notas.indexOf(opt);
    if (i > -1) this.form.notas.splice(i, 1);
    else        this.form.notas.push(opt);
    this.emitChange();
  }
  removeNota(opt: string, e: MouseEvent) {
    e.stopPropagation();
    this.form.notas = this.form.notas.filter(n => n !== opt);
    this.emitChange();
  }

  // Base
  toggleBase(opt: string) {
    const i = this.form.base.indexOf(opt);
    if (i > -1) this.form.base.splice(i, 1);
    else        this.form.base.push(opt);
    this.emitChange();
  }
  removeBase(opt: string, e: MouseEvent) {
    e.stopPropagation();
    this.form.base = this.form.base.filter(b => b !== opt);
    this.emitChange();
  }

  // Fondo
  toggleFondo(opt: string) {
    const i = this.form.fondo.indexOf(opt);
    if (i > -1) this.form.fondo.splice(i, 1);
    else        this.form.fondo.push(opt);
    this.emitChange();
  }
  removeFondo(opt: string, e: MouseEvent) {
    e.stopPropagation();
    this.form.fondo = this.form.fondo.filter(f => f !== opt);
    this.emitChange();
  }

  // Emitir al padre
  private emitChange() {
    this.sensorialData.emit({ ...this.form });
  }

  onChange() {
    this.emitChange();
  }

  // Cerrar dropdowns al click fuera
  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement) {
    if (!this.elRef.nativeElement.contains(target)) {
      this.notasOpen = this.baseOpen = this.fondoOpen = false;
    }
  }
}
