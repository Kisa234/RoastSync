// src/app/shared/services/historial.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Historial } from '../models/historial';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {

  private baseUrl = `${environment.apiUrl}/historial`;

  constructor(private http: HttpClient) {}

  create(dto:Partial<Historial>): Observable<Historial>{
    return this.http.post<Historial>(this.baseUrl,dto);
  }

  getAll(): Observable<Historial[]> {
    return this.http.get<Historial[]>(this.baseUrl);
  }

  getByUser(id_user: string): Observable<Historial[]> {
    return this.http.get<Historial[]>(`${this.baseUrl}/user/${id_user}`);
  }

  getByEntidad(id_entidad: string): Observable<Historial[]> {
    return this.http.get<Historial[]>(`${this.baseUrl}/entidad/${id_entidad}`);
  }

  getById(id_historial: string): Observable<Historial> {
    return this.http.get<Historial>(`${this.baseUrl}/${id_historial}`);
  }
}
