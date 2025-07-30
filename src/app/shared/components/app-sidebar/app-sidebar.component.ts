// src/app/shared/components/app-sidebar/app-sidebar.component.ts
import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  Coffee,
  House,
  ShoppingCart,
  Box,
  Users,
  Flame,
  ChartColumn,
  Settings,
  FlaskConical 
} from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    NgFor,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './app-sidebar.component.html',
  styles: []
})
export class SidebarComponent {
  readonly Coffee = Coffee;
  links = [
    { label: 'Dashboard',    path: '/dashboard', icon: House },
    { label: 'Pedidos',      path: '/orders',    icon: ShoppingCart },
    { label: 'Inventario',   path: '/inventory', icon: Box },
    { label: 'Usuarios',     path: '/clients',   icon: Users },
    { label: 'Tostado',      path: '/roasts',    icon: Flame },
    { label: 'Analisis',         path: '/analisis',    icon: FlaskConical  },
    // { label: 'Reportes',     path: '/reports',   icon: ChartColumn },
    // { label: 'Configuración',path: '/settings',  icon: Settings },
  ];
}
