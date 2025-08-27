import { Routes } from '@angular/router';

// Layouts
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { MainLayoutComponent } from './layouts/main/main-layout.component';

// Páginas protegidas
import { OverviewComponent } from './features/dashboard/page/overview/overview.component';
import { UsersPageComponent } from './features/users/page/users-page.component';
import { OrdersPage } from './features/orders/page/orders-page.component';
import { RoastsPage } from './features/roasts/page/roast-page.component';
import { AnalisisPage } from './features/analysis/page/analisis.component';

// Login
import { AuthComponent } from './features/auth/page/auth.component';

// Auth Guard
import { NotFoundRedirectComponent } from './shared/components/not-found-redirect/not-found-redirect.component';
import { InventoryPage } from './features/inventory/pages/inventory/inventory-page.component';
import { smartRedirectGuard } from './guards/smart-redirect.guard';
import { authGuard } from './guards/auth.guard';
import { AnalysisCompleteGuard } from './guards/analysis-complete.guard';
import { LoteTostadoExistsGuard } from './guards/lote-tostado-exists.guard';
import { SettingsPageComponent } from './features/settings/page/settings-page.component';
import { EnvioPageComponent } from './features/envios/pages/envio.page/envio.page.component';
import { MaquilaPageComponent } from './features/maquila/pages/maquila.page/maquila.page.component';


export const appRoutes: Routes = [
  // 1) Login
  {
    path: 'login',
    component: AuthLayoutComponent,
    canActivateChild: [smartRedirectGuard],
    children: [
      { path: '', component: AuthComponent }
    ]
  },

  // 2) Rutas protegidas (todo lo demás)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      // Raíz → dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Tus vistas
      { path: 'dashboard', component: OverviewComponent },
      { path: 'inventory', component: InventoryPage },
      { path: 'orders', component: OrdersPage },
      { path: 'envio', component:EnvioPageComponent},
      { path: 'roasts', component: RoastsPage },
      { path: 'analisis', component: AnalisisPage },
      { path: 'clients', component: UsersPageComponent },
      { path: 'settings', component: SettingsPageComponent },
      { path: 'maquila', component: MaquilaPageComponent },


      // ...otras rutas
      {
        path: 'pdf/:type/:id',
        loadComponent: () =>
          import(
            './features/inventory/pages/analisis/analisis-pdf-page.component'
          ).then(m => m.PdfPageComponent),
        canActivate: [AnalysisCompleteGuard]
      },
      {
        path: 'report-lote-tostado/:id',
        loadComponent: () =>
          import('./shared/components/report-lote-tostado/report-lote-tostado.component')
        .then(m => m.ReportLoteTostadoComponent),
        canActivate: [LoteTostadoExistsGuard],
      },
      // Cualquier otra:  
      // – si no estás auth: authGuard → UrlTree('/login')  
      // – si sí estás auth: redirige a dashboard
      { path: '**', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
