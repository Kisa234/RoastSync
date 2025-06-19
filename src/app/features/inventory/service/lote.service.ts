import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lote } from '../../../shared/models/lote';
import { environment } from '../../../../environments/environment';


@Injectable({ providedIn: 'root' })
export class LoteService {
  private baseUrl = `${environment.apiUrl}/lote`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Lote[]> {
    return this.http.get<Lote[]>(this.baseUrl);
  }

  getById(id: string): Observable<Lote> {
    return this.http.get<Lote>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Lote>): Observable<Lote> {
    return this.http.post<Lote>(`${this.baseUrl}/`, data);
  }

  update(id: string, data: Partial<Lote>): Observable<Lote> {
    return this.http.put<Lote>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  createByMuestra(id:string,peso:number): Observable<Lote> {
    return this.http.post<Lote>(`${this.baseUrl}/muestra/${id}`, {
      'peso': peso
    });
  }
}
