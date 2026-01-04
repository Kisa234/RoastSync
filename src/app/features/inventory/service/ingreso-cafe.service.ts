import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IngresoCafe } from '../../../shared/models/ingreso-cafe';

@Injectable({
  providedIn: 'root'
})
export class IngresoCafeService {

  private baseUrl = `${environment.apiUrl}/ingreso-cafe`;

  constructor(private http: HttpClient) {}

  /** Crear ingreso de café */
  createIngreso(payload : Partial<IngresoCafe>): Observable<IngresoCafe> {
    return this.http.post<IngresoCafe>(this.baseUrl, payload);
  }

  /** Obtener todos los ingresos */
  getAllIngresos(): Observable<IngresoCafe[]> {
    return this.http.get<IngresoCafe[]>(this.baseUrl);
  }

  /** Obtener ingreso por ID */
  getIngresoById(id: string): Observable<IngresoCafe> {
    return this.http.get<IngresoCafe>(`${this.baseUrl}/${id}`);
  }

  /** Obtener ingresos por lote */
  getIngresosByLote(id_lote: string): Observable<IngresoCafe[]> {
    return this.http.get<IngresoCafe[]>(
      `${this.baseUrl}/lote/${id_lote}`
    );
  }

  /** Eliminar ingreso */
  deleteIngreso(id: string): Observable<IngresoCafe> {
    return this.http.delete<IngresoCafe>(`${this.baseUrl}/${id}`);
  }
}
