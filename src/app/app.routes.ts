import { Routes } from '@angular/router';

// Layouts
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { MainLayoutComponent } from './layouts/main/main-layout.component';
import { ClientLayoutComponent } from './layouts/client/client-layout.component';

// Pages
import { OverviewComponent } from './features/dashboard/page/overview/overview.component';
import { RoastsPage } from './features/roasts/page/main/roast-page.component';
import { AnalisisPage } from './features/analysis/page/analisis.component';
import { InventoryPage } from './features/inventory/pages/inventory/inventory-page.component';
import { SettingsPageComponent } from './features/settings/page/settings-page.component';
import { SuscriptionPageComponent } from './features/suscriptions/page/suscription-page.component';
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
import { KardexComponent } from './features/costing/pages/kardex/kardex.component';
import { CostingComponent } from './features/costing/pages/main/costing.component';
import { StadisticComponent } from './features/costing/pages/stadistic/stadistic.component';
import { StadisticRoastComponent } from './features/roasts/page/stadistic/stadistic.component';
import { RoastComponent } from './features/roasts/page/shell/roast.component';
import { BalonesGasComponent } from './features/roasts/page/balon-gas/balon-gas.component';
import { ProfileComponent } from './features/profile/page/profile.component';
import { AuthShellComponent } from './features/auth/page/shell/auth-shell.component';
import { AuthComponent } from './features/auth/page/login/auth.component';
import { ForgotPasswordComponent } from './features/auth/page/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/page/reset-password/reset-password.component';
import { MaquilaFormPage } from './features/orders/page/add-maquila-order/maquila-form-page.component';
import { OrdersShellComponent } from './features/orders/page/shell/orders-shell.component';
import { OrderFormPage } from './features/orders/page/order-form-page/order-form-page.component';
import { BolsaShellComponent } from './features/inventory/bolsa/page/shell/bolsa-shell.componten';
import { BolsaMainComponent } from './features/inventory/bolsa/page/main/bolsa-main.component';
import { ViewOrderPage } from './features/orders/page/view-order/view-order.page';
import { HistoricBolsaComponent } from './features/inventory/bolsa/page/historic/historic-bolsa.component';
import { EnviosShellComponent } from './features/envios/pages/shell/envios-shell.component';
import { OrdenDespachoFormPage } from './features/orders/page/orden-despacho-form-page/orden-despacho-form-page.component';
import { EnviosMainPage } from './features/envios/pages/main/envios-main.component';
import { EnvioFormPage } from './features/envios/pages/envio-form-page/envio-form-page.component';
import { ViewPaquetePage } from './features/envios/pages/view-paquete/view-paquete.page';
import { ViewEnvioPage } from './features/envios/pages/view-envio/view-envio.page';
import { ProgramarEnvioPage } from './features/envios/pages/programar-envio/programar-envio.page';
import { DespacharEnvioPage } from './features/envios/pages/despachar-envio/espachar-envio.page';
import { paqueteListoGuard } from './guards/paquete-listo.guard';
import { envioEstadoGuard } from './guards/envio-estado.guard';
import { UpdateInventoryComponent } from './features/inventory/update-inventory/pages/main/update-inventory.component';
import { TrasladarStockPage } from './features/inventory/update-inventory/pages/trasladar-stock/trasladar-stock.page';
import { AjustarStockPage } from './features/inventory/update-inventory/pages/ajustar-stock/ajustar-stock.page';
import { UpdateInventoryShellComponent } from './features/inventory/update-inventory/pages/shell/update-inventory-shell.component';
import { VerHistorialPage } from './shared/pages/ver-historial/ver-historial.page';
import { OrderTuesteFormPage } from './features/roasts/page/order-tueste-form-page/order-tueste-form-page.component';
import { OrderTuestesPage } from './features/roasts/page/order-tuestes-page/order-tuestes.page';
import { StadisticPedidosComponent } from './features/orders/page/stadistic-pedidos/stadistic-pedidos.component';
import { ClientDetailComponent } from './features/users/page/client-detail/client-detail.component';
import { HistoricLote } from './features/inventory/lotes-verdes/page/historic-lote/historic-lote.component';
import { ReportLoteComponent } from './features/inventory/lotes-verdes/page/report-lote/report-lote.component';

export const appRoutes: Routes = [

  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        component: AuthShellComponent,
        children: [
          { path: '', redirectTo: 'login', pathMatch: 'full' },
          {
            path: 'login',
            canActivate: [smartRedirectGuard],
            component: AuthComponent
          },
          {
            path: 'forgot-password',
            component: ForgotPasswordComponent,
          },
          {
            path: 'reset-password',
            component: ResetPasswordComponent,
          }
        ]
      }
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
              { path: 'historico/:id', component: HistoricLote },
              { path: 'reporte/:id', component: ReportLoteComponent }
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
          {
            path: 'bolsa',
            component: BolsaShellComponent,
            children: [
              {
                path: '',
                component: BolsaMainComponent
              },
              {
                path: 'historico/:id_bolsa',
                component: HistoricBolsaComponent
              }
            ]
          },
          {
            path: 'actualizar',
            component: UpdateInventoryShellComponent,
            children: [
              { path: '', component: UpdateInventoryComponent },
              { path: 'ajustar-stock', component: AjustarStockPage },
              { path: 'trasladar-stock', component: TrasladarStockPage },
            ]
          }
        ]
      },

      {
        path: 'orders',
        component: OrdersShellComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['pedidos.read'] },
        children: [
          { path: '', component: OrdersPage },
          { path: 'nuevo', component: OrderFormPage },
          { path: 'maquila/nuevo', component: MaquilaFormPage },
          {
            path: 'maquila/:id/editar',
            component: MaquilaFormPage,
            data: { mode: 'edit' },
          },
          { path: 'despacho/nuevo', component: OrdenDespachoFormPage },
          { path: 'despacho/:id/editar', component: OrdenDespachoFormPage, data: { mode: 'edit' } },
          {
            path: 'estadisticas',
            component: StadisticPedidosComponent,
          },
          {
            path: ':id/editar',
            component: OrderFormPage,
            data: { mode: 'edit' },
          },
          { path: ':id', component: ViewOrderPage },
        ]
      },
      {
        path: 'roasts',
        component: RoastComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['tostado.read'] },
        children: [
          { path: '', component: RoastsPage },
          { path: 'tueste/nuevo', component: OrderTuesteFormPage },
          { path: 'tueste/:id/editar', component: OrderTuesteFormPage, data: { mode: 'edit' } },
          { path: ':id_pedido/tuestes', component: OrderTuestesPage },
          { path: 'stadistic', component: StadisticRoastComponent },
          { path: 'balones-gas', component: BalonesGasComponent }
        ]
      },
      { path: 'historial/:id', component: VerHistorialPage },
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
          { path: 'interns', component: InternsComponent },
          { path: ':id', component: ClientDetailComponent }
        ]
      },

      {
        path: 'envios',
        component: EnviosShellComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['envios.read'] },
        children: [
          { path: '', component: EnviosMainPage },
          {
            path: 'nuevo/:id_paquete',
            component: EnvioFormPage,
            canActivate: [paqueteListoGuard],
          },
          { path: 'paquete/:id', component: ViewPaquetePage },
          { path: ':id', component: ViewEnvioPage },
        ],
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
        path: 'profile',
        component: ProfileComponent,
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