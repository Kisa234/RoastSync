import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cambio } from '../models/cambio';

@Injectable({
  providedIn: 'root'
})
export class CambioService {

  private baseUrl = `${environment.apiUrl}/cambio`;

  constructor(private http: HttpClient) {}

  /** Crear cambio (auditoría) */
  createCambio(payload: {
    entidad: string;
    id_entidad: string;
    objeto_antes: any;
    id_user: string;
    comentario?: string | null;
  }): Observable<Cambio> {
    return this.http.post<Cambio>(this.baseUrl, payload);
  }

  /** Historial por entidad */
  getCambiosByEntidad(
    entidad: string,
    id_entidad: string
  ): Observable<Cambio[]> {
    return this.http.get<Cambio[]>(
      `${this.baseUrl}/entidad/${entidad}/${id_entidad}`
    );
  }

  /** Historial por usuario */
  getCambiosByUser(id_user: string): Observable<Cambio[]> {
    return this.http.get<Cambio[]>(
      `${this.baseUrl}/user/${id_user}`
    );
  }
}
