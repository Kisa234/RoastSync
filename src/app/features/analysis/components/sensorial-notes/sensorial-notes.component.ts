import {  Component,  EventEmitter,  HostListener,  ElementRef,  Output,  OnInit, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoffeeFlavors, ICoffeeFlavor } from '../../../../shared/models/rueda-sabores';
import { SensorialData } from '../../../../shared/models/sensorial-data';
import { SelectSearchComponent } from '../../../../shared/components/select-search/select-search.component';

interface Option {
  label: string;
  value: string;
}

@Component({
  selector: 'app-sensorial-notes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectSearchComponent
  ],
  templateUrl: './sensorial-notes.component.html'
})
export class SensorialNotesComponent implements OnInit {
  @Output() sensorialData = new EventEmitter<SensorialData>();
  @Input() comentario?: string = '';

  form: SensorialData = {
    notas: [],
    acidez: '',
    cuerpo: ''
  };

  flavorOptions: Option[] = [];
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
    const flat = this.flattenFlavors(CoffeeFlavors);
    this.flavorOptions = flat.map(f => ({
      label: f,
      value: f
    }));
    if (this.comentario && this.comentario !== '{}') {
      try {
        const data = JSON.parse(this.comentario) as SensorialData;
        this.form = data;
      } catch (e) {
        console.error('Error parsing comentario:', e);
      }
    }
    
  }

  private flattenFlavors(arr: ICoffeeFlavor[]): string[] {
    return arr.reduce<string[]>((acc, cur) => {
      acc.push(cur.name);
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
