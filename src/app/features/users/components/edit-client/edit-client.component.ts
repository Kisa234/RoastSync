import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Check, ChevronDown, LucideAngularModule, X } from 'lucide-angular';
import { UserService } from '../../service/users-service.service';
import { User } from '../../../../shared/models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { format } from 'date-fns';

@Component({
  selector: 'edit-client',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './edit-client.component.html',
  styles: ``
})
export class EditClientComponent implements OnInit {
  @Output() close  = new EventEmitter<void>();
  @Output() update = new EventEmitter<User>();
  @Input() userId?: string;

  model: Partial<User> = {};

  // Campo auxiliar para el input type="date" (requiere string 'yyyy-MM-dd')
  fechaPrimeraCompraStr: string = '';

  readonly X           = X;
  readonly Check       = Check;
  readonly ChevronDown = ChevronDown;

  constructor(private svc: UserService) {}

  ngOnInit(): void {
    this.svc.getUserById(this.userId!).subscribe(user => {
      this.model = user;
      // Convertir Date a string para el input date
      if (user.fecha_primera_compra) {
        this.fechaPrimeraCompraStr = format(new Date(user.fecha_primera_compra), 'yyyy-MM-dd');
      }
    });
  }

  onCancel() {
    this.close.emit();
  }

  onSave() {
    // Convertir string del input a Date, o null si está vacío
    const payload: Partial<User> = {
      ...this.model,
      fecha_primera_compra: this.fechaPrimeraCompraStr
        ? new Date(this.fechaPrimeraCompraStr)
        : null,
    };

    this.svc.updateUser(this.userId!, payload).subscribe(u => {
      this.update.emit(u);
      this.close.emit();
    });
  }
}