import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Muestra } from '../../../shared/models/muestra';
import { environment } from '../../../../environments/environment';


@Injectable({ providedIn: 'root' })
export class MuestraService {
  private baseUrl = `${environment.apiUrl}/muestra`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Muestra[]> {
    return this.http.get<Muestra[]>(this.baseUrl);
  }

  getById(id: string): Observable<Muestra> {
    return this.http.get<Muestra>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Muestra>): Observable<Muestra> {
    return this.http.post<Muestra>(this.baseUrl, data, {
      withCredentials: true // 🔐 importante para enviar la cookie
    });
  }

  update(id: string, data: Partial<Muestra>): Observable<Muestra> {
    return this.http.put<Muestra>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  complete(id: string): Observable<Muestra> {
    return this.http.patch<Muestra>(`${this.baseUrl}/complete/${id}`, {});
  }
}
