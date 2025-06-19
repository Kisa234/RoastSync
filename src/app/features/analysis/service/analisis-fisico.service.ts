import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AnalisisFisico } from '../../../shared/models/analisis-fisico';



@Injectable({
  providedIn: 'root'
})
export class AnalisisFisicoService {

  private baseUrl = `${environment.apiUrl}/analisisFisico`;

  constructor(private http: HttpClient) {}

  createAnalisis(data: AnalisisFisico, id_lote:string): Observable<AnalisisFisico> {
    return this.http.post<AnalisisFisico>(`${this.baseUrl}/${id_lote}`, data);
  }

  getAnalisisById(id: string): Observable<AnalisisFisico> {
    return this.http.get<AnalisisFisico>(`${this.baseUrl}/${id}`);
  }

  updateAnalisis(id_lote: string, data: AnalisisFisico): Observable<AnalisisFisico> {
    return this.http.put<AnalisisFisico>(`${this.baseUrl}/${id_lote}`, data);
  }

  getAllAnalisis(): Observable<AnalisisFisico[]> {
    return this.http.get<AnalisisFisico[]>(`${this.baseUrl}`);
  }

  deleteAnalisis(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
 
}
