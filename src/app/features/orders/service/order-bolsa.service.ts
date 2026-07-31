import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PedidoBolsa } from '../../../shared/models/pedido-bolsa';

@Injectable({ providedIn: 'root' })
export class OrderBolsaService {
  private base = `${environment.apiUrl}/pedido-bolsa`;

  constructor(private http: HttpClient) {}

  getByPedido(idPedido: string): Observable<PedidoBolsa[]> {
    return this.http.get<PedidoBolsa[]>(`${this.base}/pedido/${idPedido}`);
  }

  addBolsa(idPedido: string, data: Partial<PedidoBolsa>): Observable<PedidoBolsa> {
    return this.http.post<PedidoBolsa>(`${this.base}/pedido/${idPedido}`, data);
  }

  updateBolsa(id: string, data: Partial<PedidoBolsa>): Observable<PedidoBolsa> {
    return this.http.put<PedidoBolsa>(`${this.base}/${id}`, data);
  }

  deleteBolsa(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}