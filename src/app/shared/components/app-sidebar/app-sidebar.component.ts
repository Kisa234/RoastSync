// src/app/shared/components/app-sidebar/app-sidebar.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { LucideAngularModule, Store, User, Warehouse } from 'lucide-angular';
import {
  Coffee,
  House,
  ShoppingCart,
  Box,
  Users,
  Flame,
  Settings,
  FlaskConical,
  Truck,
  PackageSearch,
  Gift,
  Calculator,
  ChevronDown,
  ChevronLeft
} from 'lucide-angular';
import { filter } from 'rxjs/operators';

type SidebarLink = {
  type: 'link';
  label: string;
  path: string;
  icon: any;
};

type SidebarGroup = {
  type: 'group';
  label: string;
  icon: any;
  key: string;
  children: SidebarLink[]; // ✅ SOLO LINKS
};

type SidebarItem = SidebarLink | SidebarGroup;

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgClass,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './app-sidebar.component.html'
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();
  readonly Flame = Flame;
  readonly ChevronDown = ChevronDown;
  readonly ChevronLeft = ChevronLeft;


  /** estado de submenús */
  openGroups: Record<string, boolean> = {
    inventory: true
  };

  items: SidebarItem[] = [
    { type: 'link', label: 'Dashboard', path: '/dashboard', icon: House },
    {
      type: 'group',
      label: 'Inventario',
      icon: Box,
      key: 'inventory',
      children: [
        // { type: 'link', label: 'Resumen', path: '/inventory', icon: Box },
        { type: 'link', label: 'Muestras', path: '/inventory/muestras', icon: Box },
        { type: 'link', label: 'Lotes Verdes', path: '/inventory/lotes-verdes', icon: Box },
        { type: 'link', label: 'Lotes Tostados', path: '/inventory/lotes-tostados', icon: Box },
        { type: 'link', label: 'Productos', path: '/products', icon: Box },
        { type: 'link', label: 'Almacenes', path: '/inventory/almacenes', icon: Box },
        { type: 'link', label: 'Insumos', path: '/inventory/insumos', icon: Box },

      ]
    },
    { type: 'link', label: 'Costeo', path: '/costing', icon: Calculator },
    { type: 'link', label: 'Pedidos', path: '/orders', icon: ShoppingCart },
    { type: 'link', label: 'Envios', path: '/envio', icon: Truck },
    { type: 'link', label: 'Tostado', path: '/roasts', icon: Flame },
    { type: 'link', label: 'Analisis', path: '/analisis', icon: FlaskConical },
    {
      type: 'group',
      label: 'Usuarios',
      icon: Users,
      key: 'users',
      children: [
        { type: 'link', label: 'Clientes', path: '/users', icon: Users },
        { type: 'link', label: 'Usuarios internos', path: '/users/interns', icon: Users },
      ]
    },
    { type: 'link', label: 'Suscripcion', path: '/suscriptions', icon: Gift },
    { type: 'link', label: 'Configuración', path: '/settings', icon: Settings }
  ];


  constructor(private router: Router) {
    // abre el grupo automáticamente si estás dentro de inventario
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        const url = this.router.url;
        this.openGroups['inventory'] = url.startsWith('/inventory');
      });
  }

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  toggleGroup(key: string) {
    if (this.collapsed) return;
    this.openGroups[key] = !this.openGroups[key];
  }

  isGroupActive(group: any): boolean {
    return group.children.some((c: any) =>
      this.router.url.startsWith(c.path)
    );
  }
}
