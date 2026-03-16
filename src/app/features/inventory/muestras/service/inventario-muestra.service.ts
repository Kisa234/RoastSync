import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { InventarioMuestra } from '../../../../shared/models/inventario-muestra';

@Injectable({
  providedIn: 'root'
})
export class InventarioMuestraService {
  private baseUrl = `${environment.apiUrl}/inventario-muestra`;

  constructor(private http: HttpClient) {}

  create(data: Partial<InventarioMuestra>): Observable<InventarioMuestra> {
    return this.http.post<InventarioMuestra>(this.baseUrl, data);
  }

  getByAlmacen(id_almacen: string): Observable<InventarioMuestra[]> {
    return this.http.get<InventarioMuestra[]>(`${this.baseUrl}/almacen/${id_almacen}`);
  }

  getByMuestraAndAlmacen(id_muestra: string, id_almacen: string): Observable<InventarioMuestra> {
    return this.http.get<InventarioMuestra>(
      `${this.baseUrl}/muestra/${id_muestra}/almacen/${id_almacen}`
    );
  }

  update(id_inventario: string, data: Partial<InventarioMuestra>): Observable<InventarioMuestra[]> {
    return this.http.put<InventarioMuestra[]>(`${this.baseUrl}/${id_inventario}`, data);
  }
}
