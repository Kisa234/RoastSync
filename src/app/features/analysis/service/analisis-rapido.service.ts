import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalisisRapido } from '../../../shared/models/analisis-rapido';
import { environment } from '../../../../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class AnalisisRapidoService {

  private baseUrl = `${environment.apiUrl}/analisisRapido`;

  constructor(private http: HttpClient) {}

  createAnalisis(data: AnalisisRapido,id_lote_tostado:string): Observable<AnalisisRapido> {
    return this.http.post<AnalisisRapido>(`${this.baseUrl}/lote/${id_lote_tostado}`, data);
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
