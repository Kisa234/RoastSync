import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalisisSensorial } from '../../../shared/models/analisis-sensorial';
import { environment } from '../../../../enviroments/enviroment';


@Injectable({
  providedIn: 'root'
})
export class AnalisisSensorialService {
  private baseUrl = `${environment.apiUrl}/AnalisisSensorial`;

  constructor(private http: HttpClient) {}

  // Crear un nuevo análisis sensorial
  createAnalisisSensorial(data: AnalisisSensorial,id_lote:string): Observable<AnalisisSensorial> {
    return this.http.post<AnalisisSensorial>(`${this.baseUrl}/${id_lote}`, data);
  }

  // Obtener un análisis sensorial por ID
  getAnalisisById(id: string): Observable<AnalisisSensorial> {
    return this.http.get<AnalisisSensorial>(`${this.baseUrl}/${id}`);
  }

  // Actualizar un análisis sensorial
  updateAnalisisSensorial(id: string, data: AnalisisSensorial): Observable<AnalisisSensorial> {
    return this.http.put<AnalisisSensorial>(`${this.baseUrl}/${id}`, data);
  }

  // Obtener todos los análisis sensoriales
  getAllAnalisisSensorial(): Observable<AnalisisSensorial[]> {
    return this.http.get<AnalisisSensorial[]>(`${this.baseUrl}`);
  }

  // Eliminar un análisis sensorial por ID
  deleteAnalisisSensorial(id: string): Observable<AnalisisSensorial> {
    return this.http.delete<AnalisisSensorial>(`${this.baseUrl}/${id}`);
  }
}
