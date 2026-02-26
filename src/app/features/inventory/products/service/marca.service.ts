import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Marca } from '../../../../shared/models/marca';

export interface CreateMarcaDto {
  nombre: string;
  descripcion?: string | null;
}

export interface UpdateMarcaDto {
  nombre?: string;
  descripcion?: string | null;
  activo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class MarcaService {
  private baseUrl = `${environment.apiUrl}/marca`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Marca[]> {
    return this.http.get<Marca[]>(this.baseUrl);
  }

  getById(id: string): Observable<Marca> {
    return this.http.get<Marca>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateMarcaDto): Observable<Marca> {
    return this.http.post<Marca>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateMarcaDto): Observable<Marca> {
    return this.http.put<Marca>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}