import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Pedido } from '../../../shared/models/pedido';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly baseUrlP = `${environment.apiUrl}/p`;

  constructor(private http: HttpClient) { }

  // Get tuestes pendientes
  getTuestesPendientes(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.baseUrlP}/tueste/pendientes`);
  }
  // Get Ultimos Pedidos
  getUltimosPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.baseUrlP}/pedidos/ultimos`);
  }
  // Get Stock de Lotes
  getStockLotes() {
    return this.http.get(`${this.baseUrlP}/stock/lotes`);
  }

  getStockLotesPorClasificacion(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.baseUrlP}/lotes/clasificacion`);
  }
}
