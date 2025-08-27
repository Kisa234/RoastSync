import { Component, EventEmitter, HostListener, ElementRef, Output, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectSearchComponent } from '../../../../shared/components/select-search/select-search.component';
import { NotasService } from '../../../../shared/services/notas.service';
import { Nota } from '../../../../shared/models/notas';
import { Subject, takeUntil } from 'rxjs';

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
export class SensorialNotesComponent implements OnInit, OnDestroy {
  @Output() sensorialData = new EventEmitter<SensorialData>();
  @Input() comentario?: string = '';

  private destroy$ = new Subject<void>();

  form: SensorialData = {
    notas: [],
    acidez: '',
    cuerpo: ''
  };

  flavorOptions: Option[] = [];
  loadingNotas = false;
  loadError: string | null = null;

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

  constructor(
    private elRef: ElementRef,
    private notasService: NotasService
  ) {}

  ngOnInit() {
    // 1) Si viene comentario JSON, restauro el form
    if (this.comentario && this.comentario !== '{}') {
      try {
        const data = JSON.parse(this.comentario) as SensorialData;
        this.form = data;
      } catch (e) {
        console.error('Error parsing comentario:', e);
      }
    }

    // 2) Cargar notas desde el servicio y aplanar por jerarquía
    this.loadingNotas = true;
    this.loadError = null;

    this.notasService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notas) => {
          const flatOrdered = this.flattenNotasByHierarchy(notas);
          // Usamos el "name" como valor (igual que antes con el JSON)
          // y evitamos duplicados por seguridad
          const uniqueNames = Array.from(new Set(flatOrdered.map(n => n.name)));
          this.flavorOptions = uniqueNames.map(name => ({ label: name, value: name }));
          this.loadingNotas = false;
        },
        error: (err) => {
          console.error('Error cargando notas:', err);
          this.loadError = 'No se pudieron cargar las notas.';
          this.loadingNotas = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Aplana las notas en orden jerárquico (padre → hijos),
   * usando parentId. Ordena alfabéticamente por name en cada nivel.
   */
  private flattenNotasByHierarchy(notas: Nota[]): Nota[] {
    const byParent = new Map<string | null, Nota[]>();

    for (const n of notas) {
      const key = n.parentId ?? null;
      const list = byParent.get(key) ?? [];
      list.push(n);
      byParent.set(key, list);
    }

    const sortByName = (a: Nota, b: Nota) =>
      a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });

    for (const [k, arr] of byParent.entries()) {
      arr.sort(sortByName);
      byParent.set(k, arr);
    }

    const out: Nota[] = [];
    const visit = (parentId: string | null) => {
      const children = byParent.get(parentId) ?? [];
      for (const child of children) {
        out.push(child);
        visit(child.id);
      }
    };

    // Raíces = sin parentId (null)
    visit(null);
    return out;
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

// Asegúrate de tener este tipo importado (lo tenías en tu snippet original)
export interface SensorialData {
  notas: string[];
  acidez: string;
  cuerpo: string;
}
