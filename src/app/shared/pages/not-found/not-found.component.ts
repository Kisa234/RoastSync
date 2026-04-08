import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, TriangleAlert, House } from 'lucide-angular';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './not-found.component.html'
})
export class NotFoundComponent {
  readonly TriangleAlert = TriangleAlert;
  readonly House = House;

  constructor(private router: Router) {}

  
}