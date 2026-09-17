import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pedido, PedidoConLote } from '../../../shared/models/pedido';
import { environment } from '../../../../environments/environment';
import { EstadisticasTueste } from '../../../shared/models/estadisticas-tueste';
import { EstadisticasPedidos } from '../../../shared/models/estadisticas-pedidos';


@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private base = `${environment.apiUrl}/pedido`;

  constructor(private http: HttpClient) { }

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
  getPedidosByLote(idLote: string): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.base}/lote/${idLote}`);
  }

  setFacturado(id: string): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.base}/facturar/${id}`, {});
  }


  getPedidosConLote(): Observable<PedidoConLote[]> {
    return this.http.get<PedidoConLote[]>(`${this.base}/con-lote`);
  }

  getPedidoConLote(id: string): Observable<PedidoConLote> {
    return this.http.get<PedidoConLote>(`${this.base}/con-lote/${id}`);
  }

  getPedidosConLoteByEstadoYTipo(estado: string, tipo: string): Observable<PedidoConLote[]> {
    return this.http.get<PedidoConLote[]>(`${this.base}/con-lote/estado/${estado}/tipo/${encodeURIComponent(tipo)}`);
  }


  /** Obtener pedidos por rango de fechas */
  getPedidosByRango(desde: string, hasta: string): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.base}/rango`, {
      params: { desde, hasta }
    });
  }

  /** Obtener estadísticas de tueste */
  getEstadisticasTueste(desde: string, hasta: string): Observable<EstadisticasTueste> {
    return this.http.get<EstadisticasTueste>(`${this.base}/estadisticas/tueste`, {
      params: { desde, hasta }
    });
  }

  getEstadisticasPedidos(desde: string, hasta: string): Observable<EstadisticasPedidos> {
    return this.http.get<EstadisticasPedidos>(`${this.base}/estadisticas/pedidos`, {
      params: { desde, hasta }
    });
  }


  getPedidosOwnedByStore(incluirEliminados: boolean = false): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.base}/owned-by-store`, {
      params: { incluirEliminados: String(incluirEliminados) }
    });
  }

  getPedidosByUserId(id_user: string, incluirEliminados: boolean = false): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.base}/user/${id_user}`, {
      params: { incluirEliminados: String(incluirEliminados) }
    });
  }
}