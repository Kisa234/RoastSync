// src/app/features/users/components/add-client/add-client.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { FormsModule }                      from '@angular/forms';
import { LucideAngularModule }              from 'lucide-angular';
import { X, Check, ChevronDown }            from 'lucide-angular';
import { User }        from '../../../../shared/models/user';
import { UserService } from '../../service/users-service.service';

@Component({
  selector: 'add-client',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './add-client.component.html',
  styles: []
})
export class AddClientComponent {
  @Output() close  = new EventEmitter<void>();
  @Output() create = new EventEmitter<User>();

  // modelo
  model: Partial<User> = {
    rol:'cliente'
  };


  // roles disponibles
  roles = [
    { value: 'cliente',      label: 'Cliente' },
    { value: 'admin',        label: 'Administrador' },
  ];

  // icons
  readonly X           = X;
  readonly Check       = Check;
  readonly ChevronDown = ChevronDown;

  constructor(private svc: UserService) {}

  onCancel() {
    this.close.emit();
  }

  onSave() {
    if (!this.model.nombre?.trim() || !this.model.email?.trim()) {
      return;
    }
    this.svc.createUser(this.model).subscribe(u => {
      this.create.emit(u);
      this.close.emit();
    });
  }
}
