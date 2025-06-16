import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalisisRapido } from '../../../shared/models/analisis-rapido';
import { environment } from '../../../../enviroments/enviroment';



@Injectable({
  providedIn: 'root'
})
export class AnalisisRapidoService {

  private baseUrl = `${environment.apiUrl}/analisisRapido`;

  constructor(private http: HttpClient) {}

  createAnalisis(data: AnalisisRapido): Observable<AnalisisRapido> {
    return this.http.post<AnalisisRapido>(`${this.baseUrl}`, data);
  }

  getAnalisisById(id: string): Observable<AnalisisRapido> {
    return this.http.get<AnalisisRapido>(`${this.baseUrl}/${id}`);
  }

  updateAnalisis(id: string, data: AnalisisRapido): Observable<AnalisisRapido> {
    return this.http.put<AnalisisRapido>(`${this.baseUrl}/${id}`, data);
  }

  getAllAnalisis(): Observable<AnalisisRapido[]> {
    return this.http.get<AnalisisRapido[]>(`${this.baseUrl}`);
  }

  deleteAnalisis(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
