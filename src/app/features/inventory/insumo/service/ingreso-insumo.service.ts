import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IngresoInsumo } from '../../../../shared/models/ingreso-insumo';

@Injectable({
  providedIn: 'root'
})
export class IngresoInsumoService {

  private readonly baseUrl = `${environment.apiUrl}/ingreso-insumo`;

  constructor(private http: HttpClient) {}

  createIngreso(data: IngresoInsumo): Observable<IngresoInsumo> {
    return this.http.post<IngresoInsumo>(this.baseUrl, data);
  }

  getByAlmacen(id_almacen: string): Observable<IngresoInsumo[]> {
    return this.http.get<IngresoInsumo[]>(`${this.baseUrl}/almacen/${id_almacen}`);
  }

  getByInsumo(id_insumo: string): Observable<IngresoInsumo[]> {
    return this.http.get<IngresoInsumo[]>(`${this.baseUrl}/insumo/${id_insumo}`);
  }

  updateIngreso(id_ingreso: string, data: Partial<IngresoInsumo>): Observable<IngresoInsumo> {
    return this.http.put<IngresoInsumo>(`${this.baseUrl}/${id_ingreso}`, data);
  }
}