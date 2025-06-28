import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalisisSensorial } from '../../../shared/models/analisis-sensorial';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AnalisisSensorialService {
  private baseUrl = `${environment.apiUrl}/AnalisisSensorial`;

  constructor(private http: HttpClient) {}

  // Crear un nuevo análisis sensorial
  createAnalisis(data: AnalisisSensorial,id_lote:string,type:string): Observable<AnalisisSensorial> {
    return this.http.post<AnalisisSensorial>(`${this.baseUrl}/${id_lote}/${type}`, data);
  }

  // Obtener un análisis sensorial por ID
  getAnalisisById(id: string): Observable<AnalisisSensorial> {
    return this.http.get<AnalisisSensorial>(`${this.baseUrl}/${id}`);
  }

  // Actualizar un análisis sensorial
  updateAnalisis(id: string, data: AnalisisSensorial, type:string): Observable<AnalisisSensorial> {
    return this.http.put<AnalisisSensorial>(`${this.baseUrl}/${id}/${type}`, data);
  }

  // Obtener todos los análisis sensoriales
  getAllAnalisis(): Observable<AnalisisSensorial[]> {
    return this.http.get<AnalisisSensorial[]>(`${this.baseUrl}`);
  }

  // Eliminar un análisis sensorial por ID
  deleteAnalisis(id: string): Observable<AnalisisSensorial> {
    return this.http.delete<AnalisisSensorial>(`${this.baseUrl}/${id}`);
  }
}
