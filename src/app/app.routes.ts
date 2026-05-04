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
import { SettingsPageComponent } from './features/settings/page/settings-page.component';
import { SuscriptionPageComponent } from './features/suscriptions/page/suscription-page.component';
import { AuthComponent } from './features/auth/page/auth.component';
import { ClientFormComponent } from './features/client-form/pages/client-form.component';
import { LoteTostadoComponent } from './features/inventory/lotes-tostados/page/main/lote-tostado.component';
import { InternsComponent } from './features/users/page/interns/interns.component';
import { ClientsComponent } from './features/users/page/clients/clients.component';
import { MuestrasComponent } from './features/inventory/muestras/page/muestras.component';
import { LoteVerdeComponent } from './features/inventory/lotes-verdes/page/main/lote-verde.component';
import { VerMovimientosPage } from './features/inventory/almacenes/page/ver-movimientos/ver-movimientos.component';
import { AlmacenComponent } from './features/inventory/almacenes/page/main/almacen.component';
import { OrdersPage } from './features/orders/page/main/orders-page.component';

// Guards
import { smartRedirectGuard } from './guards/smart-redirect.guard';
import { authGuard } from './guards/auth.guard';
import { AnalysisCompleteGuard } from './guards/analysis-complete.guard';
import { LoteTostadoExistsGuard } from './guards/lote-tostado-exists.guard';
import { permissionGuard } from './guards/permission.guard';
import { UpdateInventoryComponent } from './features/inventory/update-inventory/pages/update-inventory.component';
import { EnvioPageComponent } from './features/envios/pages/main/envio.page.component';
import { KardexComponent } from './features/costing/pages/kardex/kardex.component';
import { CostingComponent } from './features/costing/pages/main/costing.component';
import { StadisticComponent } from './features/costing/pages/stadistic/stadistic.component';

export const appRoutes: Routes = [

  {
    path: 'login',
    component: AuthLayoutComponent,
    canActivateChild: [smartRedirectGuard],
    children: [
      { path: '', component: AuthComponent }
    ]
  },

  {
    path: 'client',
    component: ClientLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'box-form', component: ClientFormComponent },
      {
        path: 'unauthorized',
        loadComponent: () =>
          import('./shared/pages/unauthorized/unauthorized.component')
            .then(m => m.UnauthorizedComponent)
      },
      {
        path: '**',
        loadComponent: () =>
          import('./shared/pages/not-found/not-found.component')
            .then(m => m.NotFoundComponent)
      }
    ]
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'unauthorized',
        loadComponent: () =>
          import('./shared/pages/unauthorized/unauthorized.component')
            .then(m => m.UnauthorizedComponent)
      },

      {
        path: 'dashboard',
        component: OverviewComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['dashboard.read'] }
      },

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
                  import('./features/inventory/insumo/page/main/insumo.component')
                    .then(m => m.InsumoComponent)
              },
              {
                path: 'movimientos/:id',
                loadComponent: () =>
                  import('./features/inventory/insumo/page/movimientos-insumo/movimientos-insumo.component')
                    .then(m => m.MovimientosInsumoPageComponent)
              }
            ]
          },
          {
            path: 'productos',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/inventory/products/page/main/product-page.component')
                    .then(m => m.ProductPageComponent)
              },
              {
                path: 'movimientos/:id',
                loadComponent: () =>
                  import('./features/inventory/products/page/movimientos-producto/movimientos-producto.component')
                    .then(m => m.MovimientosProductoPageComponent)
              }
            ]
          },
          { path: 'actualizar', component: UpdateInventoryComponent }
        ]
      },

      {
        path: 'orders',
        component: OrdersPage,
        canActivate: [permissionGuard],
        data: { permissions: ['pedidos.read'] }
      },

      {
        path: 'roasts',
        component: RoastsPage,
        canActivate: [permissionGuard],
        data: { permissions: ['tostado.read'] }
      },

      {
        path: 'analisis',
        component: AnalisisPage,
        canActivate: [permissionGuard],
        data: { permissions: ['analisis.read'] }
      },

      {
        path: 'users',
        canActivate: [permissionGuard],
        data: { permissions: ['usuarios.read'] },
        children: [
          { path: '', component: ClientsComponent },
          { path: 'interns', component: InternsComponent }
        ]
      },

      {
        path: 'envio',
        component: EnvioPageComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['envios.read'] }
      },

      {
        path: 'settings',
        component: SettingsPageComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['configuracion.read'] }
      },

      {
        path: 'suscriptions',
        component: SuscriptionPageComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['suscripcion.read'] }
      },

      {
        path: 'costing',
        canActivate: [permissionGuard],
        data: { permissions: ['costeo.read'] },
        children: [
          { path: '', redirectTo: 'calculadora', pathMatch: 'full' },
          {
            path: 'calculadora',
            component: CostingComponent,
            canActivate: [permissionGuard],
            data: { permissions: ['costeo.read'] }
          },
          {
            path: 'prices',
            component: KardexComponent,
            canActivate: [permissionGuard],
            data: { permissions: ['costeo.kardex.read'] }
          },
          {
            path: 'stadistics',
            component: StadisticComponent,
            canActivate: [permissionGuard],
            data: { permissions: ['costeo.read'] }
          }
        ]
      },

      {
        path: 'pdf/:type/:id',
        loadComponent: () =>
          import('./features/inventory/pages/analisis/analisis-pdf-page.component')
            .then(m => m.PdfPageComponent),
        canActivate: [AnalysisCompleteGuard]
      },

      {
        path: '**',
        loadComponent: () =>
          import('./shared/pages/not-found/not-found.component')
            .then(m => m.NotFoundComponent)
      }
    ]
  }
];