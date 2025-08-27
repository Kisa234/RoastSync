import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateNota, Nota, UpdateNota } from '../models/notas';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotasService {
  private readonly baseUrl = `${environment.apiUrl}/notas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Nota[]> {
    return this.http.get<Nota[]>(this.baseUrl);
  }

  getById(id: string): Observable<Nota> {
    return this.http.get<Nota>(`${this.baseUrl}/${id}`);
  }

  create(data: CreateNota): Observable<Nota> {
    return this.http.post<Nota>(this.baseUrl, data);
  }

  update(id: string, data: UpdateNota): Observable<Nota> {
    return this.http.put<Nota>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<Nota> {
    return this.http.delete<Nota>(`${this.baseUrl}/${id}`);
  }
}
