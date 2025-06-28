import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoteTostado } from '../../../shared/models/lote-tostado';
import { environment } from '../../../../environments/environment';
import { FichaTueste } from '../../../shared/models/ficha-tueste';

@Injectable({ providedIn: 'root' })
export class LoteTostadoService {
  private baseUrl = `${environment.apiUrl}/loteTostado`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<LoteTostado[]> {
    return this.http.get<LoteTostado[]>(this.baseUrl);
  }

  getById(id: string): Observable<LoteTostado> {
    return this.http.get<LoteTostado>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<LoteTostado>): Observable<LoteTostado> {
    return this.http.post<LoteTostado>(this.baseUrl, data);
  }

  update(id: string, data: Partial<LoteTostado>): Observable<LoteTostado> {
    return this.http.put<LoteTostado>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getFichaTueste(id: string): Observable<FichaTueste> {
    return this.http.get<FichaTueste>(`${this.baseUrl}/ficha/${id}`);
  }
}
