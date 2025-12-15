import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { NgIf } from '@angular/common';
import { Coffee, Mail, Lock, LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [
    ReactiveFormsModule,
    NgIf,
    LucideAngularModule
  ],
  templateUrl: './auth.component.html',
  styles: ``
})
export class AuthComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private authSvc: AuthService,
    private router: Router
  ) { }

  readonly Coffee = Coffee;
  readonly Mail = Mail;
  readonly Lock = Lock;
  readonly LucideAngularModule = LucideAngularModule;

  loading = false;
  loginForm!: FormGroup;
  errorMsg: string | null = null;


  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email() {
    return this.loginForm.get('email')!;
  }
  get password() {
    return this.loginForm.get('password')!;
  }

  async onSubmit() {
    if (!this.loginForm || this.loginForm.invalid) return;

    this.loading = true;
    const { email, password } = this.loginForm.value;

    try {
      // 1) Login y guardar tokens
      await this.authSvc.login(email, password).toPromise();

      // 2) Obtener rol REAL desde el backend (/me)
      const user = await this.authSvc.checkSession().toPromise();

      // 3) Redirección según rol
      if (user!.rol === 'cliente') {
        this.router.navigate(['/suscriptions']);
      } else {
        this.router.navigate(['/dashboard']);
      }

    } catch (err: any) {
      this.errorMsg = err?.error?.error || 'Error al iniciar sesión';
    } finally {
      this.loading = false;
    }
  }


}
