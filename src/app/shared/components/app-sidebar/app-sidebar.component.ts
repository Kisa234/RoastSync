import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { FilePenLine, LucideAngularModule, Users, Flame, ChartBar, LogOut, UserCircle } from 'lucide-angular';
import { PermissionAccessService } from '../../services/permission-access.service';
import {
  House,
  ShoppingCart,
  Box,
  Settings,
  FlaskConical,
  Truck,
  Gift,
  Calculator,
  ChevronDown,
  ChevronLeft
} from 'lucide-angular';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../features/auth/service/auth.service';
import { UiService } from '../../services/ui.service';

type SidebarLink = {
  type: 'link';
  label: string;
  path: string;
  icon: any;
  permissions?: string | string[];
};

type SidebarGroup = {
  type: 'group';
  label: string;
  icon: any;
  key: string;
  permissions?: string | string[];
  children: SidebarLink[];
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
  templateUrl: './app-sidebar.component.html',
  styleUrls: ['./app-sidebar.component.css']
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  readonly Flame = Flame;
  readonly ChevronDown = ChevronDown;
  readonly ChevronLeft = ChevronLeft;
  readonly LogOut = LogOut;

  openGroups: Record<string, boolean> = {
    inventory: false,
    users: false,
    roasts: false
  };

  private allItems: SidebarItem[] = [
    {
      type: 'link',
      label: 'Dashboard',
      path: '/dashboard',
      icon: House,
      permissions: 'dashboard.read'
    },
    {
      type: 'group',
      label: 'Inventario',
      icon: Box,
      key: 'inventory',
      children: [
        {
          type: 'link',
          label: 'Almacenes',
          path: '/inventory/almacen',
          icon: Box,
          permissions: 'inventario.almacenes.read'
        },
        {
          type: 'link',
          label: 'Muestras',
          path: '/inventory/muestras',
          icon: Box,
          permissions: 'inventario.muestras.read'
        },
        {
          type: 'link',
          label: 'Lotes Verdes',
          path: '/inventory/lotes-verdes',
          icon: Box,
          permissions: 'inventario.lotes-verdes.read'
        },
        {
          type: 'link',
          label: 'Lotes Tostados',
          path: '/inventory/lotes-tostados',
          icon: Box,
          permissions: 'inventario.lotes-tostados.read'
        },
        {
          type: 'link',
          label: 'Bolsas',
          path: '/inventory/bolsa',
          icon: Box,
          // permissions: 'inventario.bolsa.read'
        },
        {
          type: 'link',
          label: 'Productos',
          path: '/inventory/productos',
          icon: Box,
          permissions: 'inventario.productos.read'
        },
        {
          type: 'link',
          label: 'Insumos',
          path: '/inventory/insumos',
          icon: Box,
          permissions: 'inventario.insumos.read'
        },
        {
          type: 'link',
          label: 'Actualizar Inventario',
          path: '/inventory/actualizar',
          icon: FilePenLine,
          permissions: 'inventario.stock.read'
        }
      ]
    },
    {
      type: 'group',
      label: 'Pedidos',
      icon: ShoppingCart,
      key: 'orders',
      permissions: 'pedidos.read',
      children: [
        {
          type: 'link',
          label: 'Pedidos',
          path: '/orders',
          icon: ShoppingCart,
          permissions: 'pedidos.read'
        },
        {
          type: 'link',
          label: 'Estadísticas',
          path: '/orders/estadisticas',
          icon: ChartBar,
          permissions: 'pedidos.read'
        },
      ]
    },
    {
      type: 'group',
      label: 'Tostado',
      icon: Flame,
      key: 'roasts',
      permissions: 'tostado.read',
      children: [
        {
          type: 'link',
          label: 'Tostado',
          path: '/roasts',
          icon: Flame,
          permissions: 'tostado.read'
        },
        {
          type: 'link',
          label: 'Balones de Gas',
          path: '/roasts/balones-gas',
          icon: Flame,
          permissions: 'tostado.read'
        },
        {
          type: 'link',
          label: 'Estadísticas',
          path: '/roasts/stadistic',
          icon: ChartBar,
          permissions: 'tostado.read'
        }
      ]
    },
    {
      type: 'link',
      label: 'Analisis',
      path: '/analisis',
      icon: FlaskConical,
      permissions: 'analisis.read'
    },
    {
      type: 'group',
      label: 'Usuarios',
      icon: Users,
      key: 'users',
      children: [
        {
          type: 'link',
          label: 'Clientes',
          path: '/users',
          icon: Users,
          permissions: 'usuarios.read'
        },
        {
          type: 'link',
          label: 'Usuarios internos',
          path: '/users/interns',
          icon: Users,
          permissions: 'usuarios.internos.read'
        }
      ]
    },
    {
      type: 'link',
      label: 'Envios',
      path: '/envios',
      icon: Truck,
      permissions: 'envios.read'
    },
    {
      type: 'group',
      label: 'Costeo',
      icon: Calculator,
      key: 'costing',
      permissions: 'costeo.read',
      children: [
        {
          type: 'link',
          label: 'Calculadora',
          path: '/costing/calculadora',
          icon: Calculator,
          permissions: 'costeo.read'
        },
        {
          type: 'link',
          label: 'Precios',
          path: '/costing/prices',
          icon: Calculator,
          permissions: 'costeo.kardex.read'
        },
        {
          type: 'link',
          label: 'Estadísticas',
          path: '/costing/stadistics',
          icon: ChartBar,
          permissions: 'costeo.read'
        }
      ]
    },
    {
      type: 'link',
      label: 'Suscripcion',
      path: '/suscriptions',
      icon: Gift,
      permissions: 'suscripcion.read'
    },
    {
      type: 'link',
      label: 'Configuración',
      path: '/settings',
      icon: Settings
    },
    {
      type: 'link',
      label: 'Perfil',
      path: '/profile',
      icon: UserCircle
    },
  ];

  items: SidebarItem[] = [];

  constructor(
    private router: Router,
    private permissionAccessService: PermissionAccessService,
    private authService: AuthService,
    private uiService: UiService
  ) {
    this.items = this.filterItemsByPermissions(this.allItems);

    // Estado inicial según la URL actual (no solo en navegaciones futuras)
    this.updateOpenGroups(this.router.url);

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.updateOpenGroups(this.router.url);
      });
  }

  private updateOpenGroups(url: string): void {
    this.openGroups['inventory'] = url.startsWith('/inventory');
    this.openGroups['users'] = url.startsWith('/users');
  }

  private hasAccess(permission?: string | string[]): boolean {
    if (!permission) return true;

    return Array.isArray(permission)
      ? this.permissionAccessService.hasAnyPermission(permission)
      : this.permissionAccessService.hasPermission(permission);
  }

  private filterItemsByPermissions(items: SidebarItem[]): SidebarItem[] {
    return items
      .map(item => {
        if (item.type === 'link') {
          return this.hasAccess(item.permissions) ? item : null;
        }

        const visibleChildren = item.children.filter(child =>
          this.hasAccess(child.permissions)
        );

        const canViewGroup = this.hasAccess(item.permissions);

        if (!canViewGroup || visibleChildren.length === 0) {
          return null;
        }

        return {
          ...item,
          children: visibleChildren
        };
      })
      .filter((item): item is SidebarItem => item !== null);
  }

  async logout() {
    const ok = await this.uiService.confirm({
      title: 'Cerrar sesión',
      message: '¿Estás seguro que deseas cerrar sesión?',
      confirmText: 'Cerrar sesión',
      cancelText: 'Cancelar'
    });

    if (!ok) return;

    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  toggleGroup(key: string) {
    if (this.collapsed) {
      this.collapsed = false;
      this.collapsedChange.emit(false);
      return;
    }
    this.openGroups[key] = !this.openGroups[key];
  }

  isGroupActive(group: SidebarGroup): boolean {
    return group.children.some(child => this.router.url.startsWith(child.path));
  }

  onLinkClick() {
    if (this.collapsed) {
      this.collapsed = false;
      this.collapsedChange.emit(false);
    }
  }
}