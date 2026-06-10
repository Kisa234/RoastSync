import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { CommonModule } from '@angular/common';
import { Coffee, Delete, LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule, CommonModule, LucideAngularModule],
  templateUrl: './auth.component.html',
  styles: ``
})
export class AuthComponent implements OnInit {

  readonly Coffee = Coffee;
  readonly Delete = Delete;

  loading  = false;
  errorMsg: string | null = null;

  dniForm!: FormGroup;

  // PIN ingresado (máx 6 dígitos)
  pin      = '';
  maxPin   = 6;

  // Teclado shuffleado
  teclado: number[] = [];

  constructor(
    private fb: FormBuilder,
    private authSvc: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dniForm = this.fb.group({
      documento_identidad: ['', [Validators.required, Validators.minLength(8)]]
    });
    this.shuffleTeclado();
  }

  get dni() { return this.dniForm.get('documento_identidad')!; }

  shuffleTeclado(): void {
    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = digits.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [digits[i], digits[j]] = [digits[j], digits[i]];
    }
    this.teclado = digits;
  }

  presionar(digit: number): void {
    if (this.pin.length >= this.maxPin) return;
    this.pin += digit.toString();
  }

  borrar(): void {
    this.pin = this.pin.slice(0, -1);
  }

  limpiar(): void {
    this.pin = '';
    this.shuffleTeclado();
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
      this.errorMsg = err?.error?.error || 'DNI o PIN incorrecto';
      this.limpiar();
    } finally {
      this.loading = false;
    }
  }
}