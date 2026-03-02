import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IngresoProducto } from '../../../../shared/models/ingreso-producto';

@Injectable({
  providedIn: 'root'
})
export class IngresoProductoService {

  private base = `${environment.apiUrl}/ingreso-producto`;

  constructor(private http: HttpClient) {}

  createIngreso(data: IngresoProducto): Observable<IngresoProducto> {
    return this.http.post<IngresoProducto>(this.base, data);
  }

  updateIngreso(id: string, data: Partial<IngresoProducto>): Observable<IngresoProducto> {
    return this.http.put<IngresoProducto>(`${this.base}/${id}`, data);
  }

  getByAlmacen(id_almacen: string): Observable<IngresoProducto[]> {
    return this.http.get<IngresoProducto[]>(`${this.base}/almacen/${id_almacen}`);
  }

  getByProducto(id_producto: string): Observable<IngresoProducto[]> {
    return this.http.get<IngresoProducto[]>(`${this.base}/producto/${id_producto}`);
  }
}