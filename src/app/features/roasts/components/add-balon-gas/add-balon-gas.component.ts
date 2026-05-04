import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Check, LucideAngularModule, X } from 'lucide-angular';

import { BalonGasService } from '../../service/balon-gas.service';
import { CreateBalonGasRequest } from '../../../../shared/models/balon-gas';

@Component({
  selector: 'add-balon-gas',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './add-balon-gas.component.html',
})
export class AddBalonGasComponent {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  readonly X = X;
  readonly Check = Check;

  loading = false;
  errorMessage = '';

  form: CreateBalonGasRequest = {
    precio: 0,
  };

  constructor(
    private readonly balonGasService: BalonGasService,
  ) {}

  save() {
    this.loading = true;
    this.errorMessage = '';

    this.balonGasService.create(this.form).subscribe({
      next: () => {
        this.loading = false;
        this.created.emit();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.error || 'No se pudo registrar el balón de gas';
      },
    });
  }
}