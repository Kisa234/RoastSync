import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DashboardService } from '../../service/dashboard.service';

@Component({
  selector: 'stock-lotes',
  imports: [CommonModule],
  templateUrl: './stock.component.html',
  styles: ``
})
export class StockComponent {
  stockTotal: number = 0;
  stockAdmin: number = 0;
  stockCliente: number = 0;

  constructor(private dashboardSvc: DashboardService) {}

  ngOnInit(): void {
    this.dashboardSvc.getStockLotes().subscribe((data: any) => {
      this.stockTotal = data.total;
      this.stockAdmin = data.admin;
      this.stockCliente = data.cliente;
    });
  }

}
