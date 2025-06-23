import { Routes } from '@angular/router';

// Layouts
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { MainLayoutComponent } from './layouts/main/main-layout.component';

// Páginas protegidas
import { OverviewComponent } from './features/dashboard/page/overview/overview.component';
import { InventoryPage } from './features/inventory/page/inventory-page.component';
import { UsersPageComponent } from './features/users/page/users-page.component';
import { OrdersPage } from './features/orders/page/orders-page.component';
import { RoastsPage } from './features/roasts/page/roast-page.component';
import { AnalisisPage } from './features/analysis/page/analisis.component';

// Login
import { AuthComponent } from './features/auth/page/auth.component';

// Auth Guard
import { authGuard } from './features/auth/service/auth.guard';
import { smartRedirectGuard } from './features/auth/service/smart-redirect.guard';
import { NotFoundRedirectComponent } from './shared/components/not-found-redirect/not-found-redirect.component';


export const appRoutes: Routes = [
  // 🟢 Redirección inicial clara
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // 🟠 Layout vacío para login
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: AuthComponent, canActivate: [smartRedirectGuard] },
    ]
  },

  // 🟢 Layout completo protegido
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: OverviewComponent },
      { path: 'inventory', component: InventoryPage },
      { path: 'orders', component: OrdersPage },
      { path: 'roasts', component: RoastsPage },
      { path: 'analisis', component: AnalisisPage },
      { path: 'clients', component: UsersPageComponent }
    ]
  },

  // ⚠️ Ruta comodín
  {
    path: '**',
    canActivate: [smartRedirectGuard],
    component: NotFoundRedirectComponent
  }
];
