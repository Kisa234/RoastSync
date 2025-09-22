import { Component, EventEmitter, Input, input, OnInit, Output } from '@angular/core';
import { Check, ChevronDown, LucideAngularModule, X } from 'lucide-angular';
import { UserService } from '../../service/users-service.service';
import { User } from '../../../../shared/models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'edit-client',
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './edit-client.component.html',
  styles: ``
})
export class EditClientComponent implements OnInit{
  @Output() close  = new EventEmitter<void>();
  @Output() update = new EventEmitter<User>();
  @Input() userId?: string;

  // modelo
  model: Partial<User> = {
    
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

  ngOnInit(): void {
    this.svc.getUserById(this.userId!).subscribe(user => {
      this.model = user;
    })
  }

  onCancel() {
    this.close.emit();
  }

  onSave() {
    this.svc.updateUser(this.userId!, this.model).subscribe(u => {
      this.update.emit(u);
      this.close.emit();
    });
  }
}
