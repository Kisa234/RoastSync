// src/app/features/envios/services/envios.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateEnvio, Envio } from '../../../shared/models/envio';

@Injectable({
  providedIn: 'root'
})
export class EnviosService {

  private readonly baseUrl = `${environment.apiUrl}/envio`;

  constructor(private http: HttpClient) {}

  // ---- CRUD ----

  createEnvio(data: CreateEnvio): Observable<Envio> {
    return this.http.post<Envio>(`${this.baseUrl}`, data);
  }

  getEnvioById(id_envio: string): Observable<Envio> {
    return this.http.get<Envio>(`${this.baseUrl}/${id_envio}`);
  }

  updateEnvio(id_envio: string, data: Partial<Envio>): Observable<Envio> {
    return this.http.put<Envio>(`${this.baseUrl}/${id_envio}`, data);
  }

  deleteEnvio(id_envio: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id_envio}`);
  }

  // ---- Queries específicas ----

  getEnviosByLote(id_lote_tostado: string): Observable<Envio[]> {
    return this.http.get<Envio[]>(`${this.baseUrl}/lote/${id_lote_tostado}`);
  }

  getEnviosByCliente(id_cliente: string): Observable<Envio[]> {
    return this.http.get<Envio[]>(`${this.baseUrl}/cliente/${id_cliente}`);
  }

  getEnviosByFechaRange(from: string, to: string): Observable<Envio[]> {
    return this.http.get<Envio[]>(`${this.baseUrl}/rango-fecha`, { params: { from, to } });
  }

  getEnviosByClasificacion(clasificacion: string): Observable<Envio[]> {
    return this.http.get<Envio[]>(`${this.baseUrl}/clasificacion/${clasificacion}`);
  }
  
}
