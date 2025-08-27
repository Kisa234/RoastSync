// src/app/features/envios/services/ficha-envio.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateFichaEnvio, FichaEnvio } from '../../../shared/models/fichaEnvio';

@Injectable({
  providedIn: 'root'
})
export class FichaEnvioService {

  private readonly baseUrl = `${environment.apiUrl}/fichaEnvio`;

  constructor(private http: HttpClient) {}

  // ---- CRUD por id_envio ----

  createFichaEnvio(id_envio: string, data: CreateFichaEnvio): Observable<FichaEnvio> {
    return this.http.post<FichaEnvio>(`${this.baseUrl}/${id_envio}`, data);
  }

  getFichaByEnvio(id_envio: string): Observable<FichaEnvio> {
    return this.http.get<FichaEnvio>(`${this.baseUrl}/${id_envio}`);
  }

  updateFichaByEnvio(id_envio: string, data: Partial<FichaEnvio>): Observable<FichaEnvio> {
    return this.http.patch<FichaEnvio>(`${this.baseUrl}/${id_envio}`, data);
  }

  deleteFichaByEnvio(id_envio: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id_envio}`);
  }
}
