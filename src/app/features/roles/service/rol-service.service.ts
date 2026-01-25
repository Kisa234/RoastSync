import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Rol } from '../../../shared/models/rol';

@Injectable({
  providedIn: 'root'
})
export class RolService {

  private baseUrl = `${environment.apiUrl}/rol`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.baseUrl);
  }

  create(payload: {
    nombre: string;
    descripcion?: string;
  }) {
    return this.http.post(this.baseUrl, payload);
  }

  update(id: string, payload: Partial<Rol>) {
    return this.http.put(`${this.baseUrl}/${id}`, payload);
  }
}
