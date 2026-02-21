import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Inventario } from '../../../shared/models/inventario';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private base = `${environment.apiUrl}/inventario`;

  constructor(private http: HttpClient) {}

  /** Obtener todo el inventario */
  getInventarios(): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(this.base);
  }

  /** Obtener un inventario por su ID */
  getInventarioById(id: string): Observable<Inventario> {
    return this.http.get<Inventario>(`${this.base}/${id}`);
  }

  /** Crear un nuevo registro de inventario */
  createInventario(data: Partial<Inventario>): Observable<Inventario> {
    return this.http.post<Inventario>(this.base, data);
  }

  /** Actualizar un registro de inventario */
  updateInventario(id: string, data: Partial<Inventario>): Observable<Inventario> {
    return this.http.put<Inventario>(`${this.base}/${id}`, data);
  }

  /** Eliminar un registro de inventario */
  deleteInventario(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
