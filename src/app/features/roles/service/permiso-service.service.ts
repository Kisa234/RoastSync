import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Permiso } from '../../../shared/models/permiso';

@Injectable({
  providedIn: 'root'
})
export class PermisoService {

  private baseUrl = `${environment.apiUrl}/permiso`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Permiso[]> {
    return this.http.get<Permiso[]>(this.baseUrl);
  }

  create(payload: {
    codigo: string;
    modulo: string;
    descripcion?: string;
  }) {
    return this.http.post(this.baseUrl, payload);
  }

  update(id: string, payload: Partial<Permiso>) {
    return this.http.put(`${this.baseUrl}/${id}`, payload);
  }
}
