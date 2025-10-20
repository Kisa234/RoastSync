import { Component } from '@angular/core';
import { StockComponent } from "../../components/stock/stock.component";
import { LastOrdersComponent } from '../../components/last-orders/last-orders.component';
import { PendingRoastsComponent } from '../../components/pending-roasts/pending-roasts.component';
import { ClasificacionComponent } from "../../components/clasificacion/clasificacion.component";
import { LotesTostadosDashboardComponent } from '../../components/lotes-tostados/lotes-tostados.component';

@Component({
  selector: 'app-overview',
  imports: [StockComponent, LastOrdersComponent, PendingRoastsComponent, ClasificacionComponent, LotesTostadosDashboardComponent],
  templateUrl: './overview.component.html',
  styles: ``
})
export class OverviewComponent {

}
