import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Coffee, Eye, EyeOff, LucideAngularModule } from 'lucide-angular';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './auth.component.html',
  styles: ``
})
export class AuthComponent implements OnInit {

  readonly Coffee = Coffee;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;

  loading  = false;
  errorMsg: string | null = null;
  showPin  = false;

  dniForm!: FormGroup;
  pin = '';

  constructor(
    private fb: FormBuilder,
    private authSvc: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dniForm = this.fb.group({
      documento_identidad: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  get dni() { return this.dniForm.get('documento_identidad')!; }

  limpiar(): void {
    this.pin = '';
  }

  async onSubmit(): Promise<void> {
    if (this.dniForm.invalid || this.pin.length < 4) return;
    this.loading  = true;
    this.errorMsg = null;

    const { documento_identidad } = this.dniForm.value;
    try {
      await this.authSvc.loginPin(documento_identidad, this.pin).toPromise();
      const user = await this.authSvc.checkSession().toPromise();
      if (user!.rol === 'cliente') {
        this.router.navigate(['/suscriptions']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    } catch (err: any) {
      this.errorMsg = err?.error?.error || 'DNI o contraseña incorrectos';
      this.limpiar();
    } finally {
      this.loading = false;
    }
  }
}