import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  templateUrl: './auth-layout.component.html',
  styles: ``
})
export class AuthLayoutComponent {
  constructor() {
    console.log('🔐 AuthLayoutComponent cargado');
  }  
}
