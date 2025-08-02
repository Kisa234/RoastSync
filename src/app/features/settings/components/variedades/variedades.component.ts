import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Plus, Trash2 } from 'lucide-angular';
import { Variedad } from '../../../../shared/models/variedad';
import { VariedadService } from '../../../../shared/services/variedad.service';
import { UiService } from '../../../../shared/services/ui.service';


@Component({
  selector: 'variedades',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './variedades.component.html',
})
export class VariedadesComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  readonly X = X;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;

  variedades: Variedad[] = [];
  filteredVariedades: Variedad[] = [];
  search = '';

  constructor(
    private variedadSvc: VariedadService,
    private uiService: UiService
  ) {}

  ngOnInit(): void {
    this.loadVariedades();
  }

  private loadVariedades() {
    this.variedadSvc.getAllVariedades().subscribe(vs => {
      this.variedades = vs;
      this.filteredVariedades = [...vs];
    });
  }

  filter() {
    const term = this.search.trim().toLowerCase();
    this.filteredVariedades = this.variedades.filter(v =>
      v.nombre.toLowerCase().includes(term)
    );
  }

  agregarVariedad(nombre: string) {
    const name = nombre.trim();
    if (!name) return;
    this.variedadSvc.createVariedad({ nombre: name }).subscribe(() => {
      this.search = '';             // limpia el input
      this.loadVariedades();        // recarga lista
    });
  }

  eliminarVariedad(v: Variedad) {
    this.uiService
      .confirm({
        title: 'Confirmar Eliminación',
        message: `¿Seguro deseas eliminar "${v.nombre}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      })
      .then(confirmed => {
        if (confirmed) {
          this.variedadSvc.deleteVariedad(v.id_variedad).subscribe(() => {
            this.loadVariedades();
          });
        }
      });
  }

  onClose() {
    this.close.emit();
  }
}
