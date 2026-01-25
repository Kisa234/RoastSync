import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Permiso } from '../../../shared/models/permiso';

@Injectable({
  providedIn: 'root'
})
export class RolPermisoService {

  private baseUrl = `${environment.apiUrl}/rol-permiso`;

  constructor(private http: HttpClient) {}

  /** Asignar permiso a un rol */
  assign(payload: {
    id_rol: string;
    id_permiso: string;
  }) {
    return this.http.post(this.baseUrl, payload);
  }

  /** Obtener permisos de un rol */
  getPermisosByRol(idRol: string): Observable<Permiso[]> {
    return this.http.get<Permiso[]>(`${this.baseUrl}/${idRol}`);
  }

  /** Quitar permiso de un rol */
  remove(idRol: string, idPermiso: string) {
    return this.http.delete(
      `${this.baseUrl}/${idRol}/${idPermiso}`
    );
  }
}
