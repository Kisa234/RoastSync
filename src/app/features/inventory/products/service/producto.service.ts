import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Producto } from '../../../shared/models/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private base = `${environment.apiUrl}/producto`;

  constructor(private http: HttpClient) {}

  /** Obtener todos los productos */
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.base);
  }

  /** Obtener un producto por su ID */
  getProductoById(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.base}/${id}`);
  }

  /** Crear un nuevo producto */
  createProducto(data: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(this.base, data);
  }

  /** Actualizar un producto */
  updateProducto(id: string, data: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.base}/${id}`, data);
  }

  /** Eliminar un producto */
  deleteProducto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
