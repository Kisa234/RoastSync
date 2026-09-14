import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Pedido } from '../../../shared/models/pedido';
import { Observable } from 'rxjs';

export interface StockVerdeResponse {
  clasificacion: Record<string, number>;
  resumen: {
    total: number;
    tienda: number;
    clientes: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly baseUrlP = `${environment.apiUrl}/p`;

  constructor(private http: HttpClient) { }

  getTuestesPendientes(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.baseUrlP}/tueste/pendientes`);
  }

  getUltimosPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.baseUrlP}/pedidos/ultimos`);
  }

  getStockLotes() {
    return this.http.get(`${this.baseUrlP}/stock/lotes`);
  }

  getStockLotesPorClasificacion(): Observable<StockVerdeResponse> {
    return this.http.get<StockVerdeResponse>(`${this.baseUrlP}/lotes/clasificacion`);
  }
}