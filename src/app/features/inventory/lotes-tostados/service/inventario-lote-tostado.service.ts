import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { InventarioLoteTostado } from '../../../../shared/models/inventario-lote-tostado';

@Injectable({
  providedIn: 'root'
})
export class InventarioLoteTostadoService {
  private baseUrl = `${environment.apiUrl}/inventario-lote-tostado`;

  constructor(private http: HttpClient) { }

  create(data: Partial<InventarioLoteTostado>): Observable<InventarioLoteTostado> {
    return this.http.post<InventarioLoteTostado>(this.baseUrl, data);
  }

  getByAlmacen(id_almacen: string): Observable<InventarioLoteTostado[]> {
    return this.http.get<InventarioLoteTostado[]>(`${this.baseUrl}/almacen/${id_almacen}`);
  }

  getByLoteTostadoAndAlmacen(
    id_lote_tostado: string,
    id_almacen: string
  ): Observable<InventarioLoteTostado> {
    return this.http.get<InventarioLoteTostado>(
      `${this.baseUrl}/lote-tostado/${id_lote_tostado}/almacen/${id_almacen}`
    );
  }

  update(
    id_inventario: string,
    data: Partial<InventarioLoteTostado>
  ): Observable<InventarioLoteTostado> {
    return this.http.put<InventarioLoteTostado>(`${this.baseUrl}/${id_inventario}`, data);
  }

  

}
