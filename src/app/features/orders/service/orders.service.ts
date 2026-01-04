// src/app/features/orders/service/pedido.service.ts
import { Injectable } from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';
import { Pedido } from '../../../shared/models/pedido';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private base = `${environment.apiUrl}/pedido`;

  constructor(private http: HttpClient) {}

  /** Listar todos los pedidos */
  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.base);
  }

  /** Crear un nuevo pedido */
  createPedido(data: Partial<Pedido>): Observable<Pedido> {
    return this.http.post<Pedido>(this.base, data);
  }

  /** Marcar un pedido como completado */
  completarPedido(id: string): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.base}/completar/${id}`, {});
  }

  /** Actualizar un pedido existente */
  updatePedido(id: string, data: Partial<Pedido>): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.base}/${id}`, data);
  }

  /** Eliminar un pedido */
  deletePedido(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /** Obtener un pedido por ID */
  getPedidoById(id: string): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.base}/${id}`);
  }

  /** Filtrar pedidos por estado */
  getPedidosByEstado(estado: string): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.base}/estado/${estado}`);
  }

  /** Filtrar pedidos de un cliente */
  getPedidosByCliente(clienteId: string): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.base}/cliente/${clienteId}`);
  }

  /** Obtener pedidos preparados para tueste */
  getPedidosOrdenTueste(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.base}/orden/tueste`);
  }

  /** Obtener pedidos de tueste en una fecha dada */
  getPedidosOrdenTuesteByFecha(fecha: string): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.base}/orden/tueste/${fecha}`);
  }

  /** Obtener pedidos por lote */
  getPedidosByLote(idLote:string):Observable<Pedido[]>{
    return this.http.get<Pedido[]>(`${this.base}/lote/${idLote}`);
  }

  setFacturado(id:string):Observable<Pedido>{
    return this.http.put<Pedido>(`${this.base}/facturar/${id}`, {});
  }
}