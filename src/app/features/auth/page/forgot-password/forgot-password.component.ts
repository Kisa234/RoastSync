import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Coffee, Mail, ArrowLeft, LucideAngularModule } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, NgIf, ReactiveFormsModule, LucideAngularModule, RouterLink],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  readonly Coffee = Coffee;
  readonly Mail = Mail;
  readonly ArrowLeft = ArrowLeft;

  form: FormGroup;
  loading = false;
  sent = false;
  errorMsg: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authSvc: AuthService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() { return this.form.get('email')!; }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMsg = null;

    this.authSvc.forgotPassword(this.form.value.email).subscribe({
      next: () => {
        this.loading = false;
        this.sent = true;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.error || 'No se pudo procesar la solicitud';
      }
    });
  }
}