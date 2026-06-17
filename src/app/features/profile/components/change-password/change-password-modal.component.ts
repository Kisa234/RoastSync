import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Eye, EyeOff, KeyRound } from 'lucide-angular';

import { UserService } from '../../../users/service/users-service.service';
import { UiService } from '../../../../shared/services/ui.service';

@Component({
  selector: 'change-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './change-password-modal.component.html'
})
export class ChangePasswordModalComponent {
  readonly X = X;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly KeyRound = KeyRound;

  @Input({ required: true }) userId!: string;
  @Output() close = new EventEmitter<void>();

  form = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  };

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  saving = false;

  constructor(
    private userSvc: UserService,
    private uiSvc: UiService
  ) {}

  onCancel(): void {
    this.close.emit();
  }

  isButtonDisabled(): boolean {
    return (
      this.saving ||
      !this.form.currentPassword ||
      !this.form.newPassword ||
      !this.form.confirmNewPassword
    );
  }

  save(): void {
    const { currentPassword, newPassword, confirmNewPassword } = this.form;

    if (newPassword.length < 6) {
      this.uiSvc.alert('warning', 'Atención', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      this.uiSvc.alert('warning', 'Atención', 'Las contraseñas no coinciden');
      return;
    }

    this.saving = true;
    this.userSvc.changePassword(this.userId, currentPassword, newPassword).subscribe({
      next: () => {
        this.saving = false;
        this.uiSvc.alert('success', 'Éxito', 'Tu contraseña fue actualizada');
        this.close.emit();
      },
      error: (err) => {
        this.saving = false;
        this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo actualizar la contraseña');
      }
    });
  }
}