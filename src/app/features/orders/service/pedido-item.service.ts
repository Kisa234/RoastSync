import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PedidoItem } from '../../../shared/models/pedido-item';

@Injectable({ providedIn: 'root' })
export class PedidoItemService {
  private readonly baseUrl = `${environment.apiUrl}/pedido-item`;

  constructor(private http: HttpClient) {}

  getByPedido(id_pedido: string): Observable<PedidoItem[]> {
    return this.http.get<PedidoItem[]>(`${this.baseUrl}/pedido/${id_pedido}`);
  }
}