import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { CreateInventarioLote, InventarioLote, UpdateInventarioLote } from '../../../../shared/models/inventario-lote';

@Injectable({ providedIn: 'root' })
export class InventarioLoteService {
  private baseUrl = `${environment.apiUrl}/inventario-lote`;

  constructor(private http: HttpClient) {}
    
  create(data: CreateInventarioLote): Observable<InventarioLote> {
    return this.http.post<InventarioLote>(`${this.baseUrl}`, data);
  }

  getByAlmacen(id_almacen: string): Observable<InventarioLote[]> {
    return this.http.get<InventarioLote[]>(`${this.baseUrl}/almacen/${id_almacen}`);
  }

  getByLoteAndAlmacen(id_lote: string, id_almacen: string): Observable<InventarioLote> {
    return this.http.get<InventarioLote>(`${this.baseUrl}/lote/${id_lote}/almacen/${id_almacen}`);
  }

  update(id_inventario: string, data: UpdateInventarioLote): Observable<InventarioLote> {
    return this.http.put<InventarioLote>(`${this.baseUrl}/${id_inventario}`, data);
  }
}