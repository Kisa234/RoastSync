import { Routes } from '@angular/router';
import { OverviewComponent } from './features/dashboard/page/overview/overview.component';
import { InventoryPage } from './features/inventory/page/inventory-page.component';
import { UsersPageComponent } from './features/users/page/users-page.component';
import { OrdersPage } from './features/orders/page/orders-page.component';
import { RoastsPage } from './features/roasts/page/roast-page.component';
import { AnalisisPage } from './features/analysis/page/analisis.component';

export const appRoutes: Routes = [
    { path: '',        pathMatch: 'full', redirectTo: 'dashboard' },
    // { path: 'dashboard', component: OverviewComponent },
    { path: 'inventory', component: InventoryPage },
    { path: 'orders',    component:  OrdersPage},
    { path: 'roasts',    component: RoastsPage },
    { path: 'analisis', component: AnalisisPage},
    // { path: 'reports',   component: ReportsPageComponent },
    // { path: 'settings',  component: SettingsPageComponent },
    {path: 'clients',   component: UsersPageComponent },
    { path: '**',      redirectTo: 'dashboard' }
];
