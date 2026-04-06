import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { InventarioInsumo } from '../../../../shared/models/inventario-insumo';

@Injectable({
  providedIn: 'root'
})
export class InventarioInsumoService {
  private base = `${environment.apiUrl}/inventario-insumo`;

  constructor(private http: HttpClient) { }

  /** Obtener todo el inventario */
  getInventarios(): Observable<InventarioInsumo[]> {
    return this.http.get<InventarioInsumo[]>(this.base);
  }

  create(data: Partial<InventarioInsumo>): Observable<InventarioInsumo> {
    return this.http.post<InventarioInsumo>(this.base, data);
  }

  getByAlmacen(id_almacen: string): Observable<InventarioInsumo[]> {
    return this.http.get<InventarioInsumo[]>(`${this.base}/almacen/${id_almacen}`);
  }

  getByInsumoAndAlmacen(id_insumo: string, id_almacen: string): Observable<InventarioInsumo> {
    return this.http.get<InventarioInsumo>(
      `${this.base}/insumo/${id_insumo}/almacen/${id_almacen}`
    );
  }

  update(id_inventario: string, data: Partial<InventarioInsumo>): Observable<InventarioInsumo> {
    return this.http.put<InventarioInsumo>(`${this.base}/${id_inventario}`, data);
  }

  
}
