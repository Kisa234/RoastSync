import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Insumo, InsumoConInventarios } from '../../../../shared/models/insumo';

@Injectable({ providedIn: 'root' })
export class InsumoService {
  private base = `${environment.apiUrl}/insumo`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Insumo[]> {
    return this.http.get<Insumo[]>(this.base);
  }

  getActivos(): Observable<Insumo[]> {
    return this.http.get<Insumo[]>(`${this.base}/activos`);
  }

  getById(id_insumo: string): Observable<Insumo> {
    return this.http.get<Insumo>(`${this.base}/${id_insumo}`);
  }

  create(payload: Partial<Insumo>): Observable<Insumo> {
    return this.http.post<Insumo>(this.base, payload);
  }

  update(id_insumo: string, payload: Partial<Insumo>): Observable<Insumo> {
    return this.http.patch<Insumo>(`${this.base}/${id_insumo}`, payload);
  }

  delete(id_insumo: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id_insumo}`);
  }
  getInsumosConInventarios(): Observable<InsumoConInventarios[]> {
    return this.http.get<InsumoConInventarios[]>(`${this.base}/con-inventarios`);
  }

  getInsumoConInventariosById(id: string): Observable<InsumoConInventarios> {
    return this.http.get<InsumoConInventarios>(`${this.base}/con-inventarios/${id}`);
  }
}