import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Analisis } from '../../../shared/models/analisis';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalisisService {
  private baseUrl = `${environment.apiUrl}/analisis`;

  constructor(private http: HttpClient) {}

  // Crear análisis
  createAnalisis(data: Analisis): Observable<Analisis> {
    return this.http.post<Analisis>(`${this.baseUrl}/`, data);
  }

  // Obtener análisis por ID
  getAnalisisById(id: string): Observable<Analisis> {
    return this.http.get<Analisis>(`${this.baseUrl}/${id}`);
  }

  // Obtener todos los análisis
  getAllAnalisis(): Observable<Analisis[]> {
    return this.http.get<Analisis[]>(`${this.baseUrl}/`);
  }

  // Actualizar análisis
  updateAnalisis(id: string, data: Partial<Analisis>): Observable<Analisis> {
    return this.http.put<Analisis>(`${this.baseUrl}/${id}`, data);
  }

  // Eliminar análisis
  deleteAnalisis(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getAnalisisByLoteId(id_lote: string): Observable<Analisis> {
    return this.http.get<Analisis>(`${this.baseUrl}/lote/${id_lote}`);
  }

  getAnalisisByMuestraId(id_muestra: string): Observable<Analisis> {
    return this.http.get<Analisis>(`${this.baseUrl}/muestra/${id_muestra}`);
  }
}
