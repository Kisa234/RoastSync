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
  FlaskConical,
  Truck,
  PackageSearch 
  
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
    { label: 'Inventario',   path: '/inventory', icon: Box },
    { label: 'Pedidos',      path: '/orders',    icon: ShoppingCart },
    { label: 'Productos',      path: '/products',    icon: PackageSearch  },
    { label: 'Envios',      path: '/envio',    icon: Truck },
    { label: 'Tostado',      path: '/roasts',    icon: Flame },
    { label: 'Analisis',         path: '/analisis',    icon: FlaskConical  },
    { label: 'Usuarios',     path: '/clients',   icon: Users },
    { label: 'Configuración',path: '/settings',  icon: Settings },
    // { label: 'Reportes',     path: '/reports',   icon: ChartColumn },
  ];
}
