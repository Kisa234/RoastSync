import { Routes } from '@angular/router';

// Layouts
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { MainLayoutComponent } from './layouts/main/main-layout.component';
import { ClientLayoutComponent } from './layouts/client/client-layout.component';

// Pages
import { OverviewComponent } from './features/dashboard/page/overview/overview.component';
import { UsersPageComponent } from './features/users/page/users-page.component';
import { OrdersPage } from './features/orders/page/orders-page.component';
import { RoastsPage } from './features/roasts/page/roast-page.component';
import { AnalisisPage } from './features/analysis/page/analisis.component';
import { InventoryPage } from './features/inventory/pages/inventory/inventory-page.component';
import { EnvioPageComponent } from './features/envios/pages/envio.page/envio.page.component';
import { SettingsPageComponent } from './features/settings/page/settings-page.component';
import { ProductPageComponent } from './features/products/pages/product/product-page.component';
import { SuscriptionPageComponent } from './features/suscriptions/page/suscription-page.component';
import { AuthComponent } from './features/auth/page/auth.component';

// Guards
import { smartRedirectGuard } from './guards/smart-redirect.guard';
import { authGuard } from './guards/auth.guard';
import { AnalysisCompleteGuard } from './guards/analysis-complete.guard';
import { LoteTostadoExistsGuard } from './guards/lote-tostado-exists.guard';
import { ClientFormComponent } from './features/client-form/pages/client-form.component';

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

  // 2) CLIENTES (solo suscriptions)
  {
    path: 'client',
    component: ClientLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'box-form', component: ClientFormComponent },
      { path: '**', redirectTo: 'box-form' }
    ]
  },
  
  // 3) ADMIN (todo lo demás)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: OverviewComponent },
      { path: 'inventory', component: InventoryPage },
      { path: 'orders', component: OrdersPage },
      { path: 'envio', component: EnvioPageComponent },
      { path: 'roasts', component: RoastsPage },
      { path: 'analisis', component: AnalisisPage },
      { path: 'clients', component: UsersPageComponent },
      { path: 'settings', component: SettingsPageComponent },
      { path: 'products', component: ProductPageComponent },
      { path: 'suscriptions', component: SuscriptionPageComponent },
      
      {
        path: 'pdf/:type/:id',
        loadComponent: () =>
          import('./features/inventory/pages/analisis/analisis-pdf-page.component')
            .then(m => m.PdfPageComponent),
        canActivate: [AnalysisCompleteGuard]
      },

      {
        path: 'report-lote-tostado/:id',
        loadComponent: () =>
          import('./shared/components/report-lote-tostado/report-lote-tostado.component')
            .then(m => m.ReportLoteTostadoComponent),
        canActivate: [LoteTostadoExistsGuard]
      },

      { path: '**', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
