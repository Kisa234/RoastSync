import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { InventarioProducto  } from '../../../../shared/models/inventario-producto';

@Injectable({
  providedIn: 'root'
})
export class InventarioProductoService {
  private base = `${environment.apiUrl}/inventario-producto`;

  constructor(private http: HttpClient) {}

  /** Obtener todo el inventario */
  getInventarios(): Observable<InventarioProducto []> {
    return this.http.get<InventarioProducto []>(this.base);
  }

  /** Obtener un inventario por su ID */
  getInventarioById(id: string): Observable<InventarioProducto > {
    return this.http.get<InventarioProducto >(`${this.base}/${id}`);
  }

  /** Crear un nuevo registro de inventario */
  createInventario(data: Partial<InventarioProducto >): Observable<InventarioProducto > {
    return this.http.post<InventarioProducto >(this.base, data);
  }

  /** Actualizar un registro de inventario */
  updateInventario(id: string, data: Partial<InventarioProducto >): Observable<InventarioProducto > {
    return this.http.put<InventarioProducto >(`${this.base}/${id}`, data);
  }

  /** Eliminar un registro de inventario */
  deleteInventario(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
