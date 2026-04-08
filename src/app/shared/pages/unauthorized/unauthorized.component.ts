import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ShieldX, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './unauthorized.component.html'
})
export class UnauthorizedComponent {
  readonly ShieldX = ShieldX;
  readonly ArrowLeft = ArrowLeft;

  constructor(private router: Router) {}

}