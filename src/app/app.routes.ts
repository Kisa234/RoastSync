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
import { PdfPageComponent } from './features/inventory/components/pdf/pages/pdf-page.component';

export const appRoutes: Routes = [
  // 1) Login
  {
    path: 'login',
    component: AuthLayoutComponent,
    canActivateChild: [ smartRedirectGuard ],
    children: [
      { path: '', component: AuthComponent }
    ]
  },

  // 2) Rutas protegidas (todo lo demás)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [ authGuard ],
    children: [
      // Raíz → dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Tus vistas
      { path: 'dashboard',  component: OverviewComponent  },
      { path: 'inventory',  component: InventoryPage      },
      { path: 'orders',     component: OrdersPage         },
      { path: 'roasts',     component: RoastsPage         },
      { path: 'analisis',   component: AnalisisPage       },
      { path: 'clients',    component: UsersPageComponent },


      // ...otras rutas
      { path: 'pdf/:type/:id', component: PdfPageComponent },

      // Cualquier otra:  
      // – si no estás auth: authGuard → UrlTree('/login')  
      // – si sí estás auth: redirige a dashboard
      { path: '**', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
