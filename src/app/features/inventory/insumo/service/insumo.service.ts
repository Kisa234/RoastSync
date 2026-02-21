import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Insumo } from '../../../../shared/models/insumo';

@Injectable({ providedIn: 'root' })
export class InsumoService {
  private baseUrl = `${environment.apiUrl}/insumo`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Insumo[]> {
    return this.http.get<Insumo[]>(this.baseUrl);
  }

  getActivos(): Observable<Insumo[]> {
    return this.http.get<Insumo[]>(`${this.baseUrl}/activos`);
  }

  getById(id_insumo: string): Observable<Insumo> {
    return this.http.get<Insumo>(`${this.baseUrl}/${id_insumo}`);
  }

  create(payload: Partial<Insumo>): Observable<Insumo> {
    return this.http.post<Insumo>(this.baseUrl, payload);
  }

  update(id_insumo: string, payload: Partial<Insumo>): Observable<Insumo> {
    return this.http.patch<Insumo>(`${this.baseUrl}/${id_insumo}`, payload);
  }

  delete(id_insumo: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id_insumo}`);
  }
}