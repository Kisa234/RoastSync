import { Component, EventEmitter, Output, ViewChild, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { X, Check, ChevronDown } from 'lucide-angular';

import { MuestraService } from '../../service/muestra.service';
import { Muestra } from '../../../../shared/models/muestra';
import { VariedadService } from '../../../../shared/services/variedad.service';
import { Variedad } from '../../../../shared/models/variedad';
import { UserService } from '../../../users/service/users-service.service';
import { User } from '../../../../shared/models/user';
import { SelectSearchComponent } from '../../../../shared/components/select-search/select-search.component';

@Component({
  selector: 'add-muestra',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    SelectSearchComponent
  ],
  templateUrl: './add-muestra.component.html'
})
export class AddMuestraComponent implements OnInit {

  constructor(
    private MuestraSvc: MuestraService,
    private VariedadSvc: VariedadService,
    private userSvc: UserService,
    
  ) { }

  ngOnInit() {
    this.VariedadSvc.getAllVariedades().subscribe(variedades => {
      this.variedades = variedades;
    });
    this.userSvc.getUsers().subscribe(u => this.clientes = u);
  }

  // icons
  readonly X = X;
  readonly Check = Check;
  readonly ChevronDown = ChevronDown;

  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();

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
  variedades: Variedad[] = [];
  clientes: User[] = [];
  procesos = ['Lavado', 'Natural', 'Honey'];

  // Dropdown Propio
  showVarDropdown = false;
  filterVar = '';

  onCancel() {
    this.close.emit();
  }

  onSave() {
    this.MuestraSvc.create(this.model).subscribe(m => {
      this.create.emit();
      this.close.emit();
    });
  }

}
