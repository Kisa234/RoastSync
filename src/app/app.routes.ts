import { Routes } from '@angular/router';

// Layouts
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { MainLayoutComponent } from './layouts/main/main-layout.component';
import { ClientLayoutComponent } from './layouts/client/client-layout.component';

// Pages
import { OverviewComponent } from './features/dashboard/page/overview/overview.component';
import { RoastsPage } from './features/roasts/page/roast-page.component';
import { AnalisisPage } from './features/analysis/page/analisis.component';
import { InventoryPage } from './features/inventory/pages/inventory/inventory-page.component';
import { EnvioPageComponent } from './features/envios/pages/envio.page/envio.page.component';
import { SettingsPageComponent } from './features/settings/page/settings-page.component';
import { SuscriptionPageComponent } from './features/suscriptions/page/suscription-page.component';
import { AuthComponent } from './features/auth/page/auth.component';

// Guards
import { smartRedirectGuard } from './guards/smart-redirect.guard';
import { authGuard } from './guards/auth.guard';
import { AnalysisCompleteGuard } from './guards/analysis-complete.guard';
import { LoteTostadoExistsGuard } from './guards/lote-tostado-exists.guard';
import { ClientFormComponent } from './features/client-form/pages/client-form.component';
import { CostingComponent } from './features/costing/pages/costing.component';
import { LoteTostadoComponent } from './features/inventory/lotes-tostados/page/main/lote-tostado.component';
import { InternsComponent } from './features/users/page/interns/interns.component';
import { ClientsComponent } from './features/users/page/clients/clients.component';
import { MuestrasComponent } from './features/inventory/muestras/page/muestras.component';
import { LoteVerdeComponent } from './features/inventory/lotes-verdes/page/main/lote-verde.component';
import { VerMovimientosPage } from './features/inventory/almacenes/page/ver-movimientos/ver-movimientos.component';
import { HistoricLote } from './features/inventory/lotes-verdes/page/historic-lote/historic-lote.component';
import { AlmacenComponent } from './features/inventory/almacenes/page/main/almacen.component';
import { OrdersPage } from './features/orders/page/main/orders-page.component';
import { UpdateInventoryComponent } from './features/inventory/update-inventory/update-inventory.component';
import { ProductPageComponent } from './features/inventory/products/page/main/product-page.component';
import { InsumoComponent } from './features/inventory/insumo/page/main/insumo.component';

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
      {
        path: 'inventory',
        component: InventoryPage,
        children: [
          { path: 'muestras', component: MuestrasComponent },
          { path: 'lotes-verdes', component: LoteVerdeComponent },
          {
            path: 'lotes-verdes',
            children: [
              { path: '', component: LoteVerdeComponent },
              {
                path: 'historico/:id',
                loadComponent: () =>
                  import('./features/inventory/lotes-verdes/page/historic-lote/historic-lote.component')
                    .then(m => m.HistoricLote)
              }
            ]
          },
          {
            path: 'lotes-tostados',
            children: [

              { path: '', component: LoteTostadoComponent },

              {
                path: 'reporte/:id',
                loadComponent: () =>
                  import('./features/inventory/lotes-tostados/page/report-lote-tostado/report-lote-tostado.component')
                    .then(m => m.ReportLoteTostadoComponent),
                canActivate: [LoteTostadoExistsGuard]
              },

              {
                path: 'historico/:id',
                loadComponent: () =>
                  import('./features/inventory/lotes-tostados/page/historic-lote-tostado/historic-lote-tostado.component')
                    .then(m => m.HistoricLoteTostadoComponent),
                canActivate: [LoteTostadoExistsGuard]
              }

            ]
          },
          {
            path: 'almacen',
            component: AlmacenComponent,
            children: [

              { path: '', component: AlmacenComponent },

              { path: 'movimientos/:id', component: VerMovimientosPage },

              {
                path: 'inventario-general/:id',
                loadComponent: () =>
                  import('./features/inventory/almacenes/page/inventario-general/inventario-general.component')
                    .then(m => m.InventarioGeneralComponent)
              }

            ]
          },
          {
            path: 'insumos',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/inventory/insumo/page/main/insumo.component').then(m => m.InsumoComponent)
              },
              {
                path: 'movimientos/:id',
                loadComponent: () =>
                  import('./features/inventory/insumo/page/movimientos-insumo/movimientos-insumo.component').then(m => m.MovimientosInsumoPageComponent)
              }
            ]
          },
          {
            path: 'productos',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/inventory/products/page/main/product-page.component').then(m => m.ProductPageComponent)
              },
              {
                path: 'movimientos/:id',
                loadComponent: () =>
                  import('./features/inventory/products/page/movimientos-producto/movimientos-producto.component').then(m => m.MovimientosProductoPageComponent)
              }
            ]
          },
          { path: 'actualizar', component: UpdateInventoryComponent }
        ]
      },

      { path: 'orders', component: OrdersPage },
      { path: 'roasts', component: RoastsPage },
      { path: 'analisis', component: AnalisisPage },
      {
        path: 'users', children: [
          { path: '', component: ClientsComponent },
          { path: 'interns', component: InternsComponent }
        ]
      },
      { path: 'envio', component: EnvioPageComponent },
      { path: 'settings', component: SettingsPageComponent },
      { path: 'suscriptions', component: SuscriptionPageComponent },
      { path: 'costing', component: CostingComponent },

      {
        path: 'pdf/:type/:id',
        loadComponent: () =>
          import('./features/inventory/pages/analisis/analisis-pdf-page.component')
            .then(m => m.PdfPageComponent),
        canActivate: [AnalysisCompleteGuard]
      },




      { path: '**', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
