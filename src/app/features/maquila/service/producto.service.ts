import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateProducto, Producto, UpdateProducto } from '../../../shared/models/producto';


@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly baseUrl = `${environment.apiUrl}/producto`;

  constructor(private http: HttpClient) {}

  create(data: CreateProducto): Observable<Producto> {
    return this.http.post<Producto>(`${this.baseUrl}`, data);
  }

  list(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}`);
  }

  listActivos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/activos`);
  }

  listByLote(id_lote: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/lote/${id_lote}`);
  }

  search(term: string): Observable<Producto[]> {
    const params = new HttpParams().set('term', term);
    return this.http.get<Producto[]>(`${this.baseUrl}/search`, { params });
  }

  getById(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/${id}`);
  }

  update(id: string, data: UpdateProducto): Observable<Producto> {
    return this.http.patch<Producto>(`${this.baseUrl}/${id}`, data);
  }

  toggleActivo(id: string): Observable<Producto> {
    return this.http.patch<Producto>(`${this.baseUrl}/${id}/activo`, {});
  }

  vincularLote(id: string, id_lote: string | null): Observable<Producto> {
    return this.http.patch<Producto>(`${this.baseUrl}/${id}/lote`, { id_lote });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
