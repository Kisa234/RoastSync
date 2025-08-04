import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lote } from '../../../shared/models/lote';
import { environment } from '../../../../environments/environment';
import { BlendLotes } from '../../../shared/models/blend-lotes';
import { FusionarLotes } from '../../../shared/models/fusionar-lote';


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

  getRoaster(): Observable<Lote[]> {
    return this.http.get<Lote[]>(`${this.baseUrl}/roaster`);
  }

  create(data: Partial<Lote>): Observable<Lote> {
    return this.http.post<Lote>(`${this.baseUrl}/`, data);
  }

  createRapido(data: Partial<Lote>): Observable<Lote> {
    return this.http.post<Lote>(`${this.baseUrl}/rapido`, data);
  }

  update(id: string, data: Partial<Lote>): Observable<Lote> {
    return this.http.put<Lote>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  createByMuestra(id:string,data: Partial<Lote>): Observable<Lote> {
    return this.http.post<Lote>(`${this.baseUrl}/muestra/${id}`, data);
  }

  blendlote(data:BlendLotes): Observable<BlendLotes> {
    return this.http.post<BlendLotes>(`${this.baseUrl}/blend`, data);
  }
  
  fusionarLotes(data: FusionarLotes): Observable<FusionarLotes> {
    return this.http.post<FusionarLotes>(`${this.baseUrl}/fusionar`, data);
  }
  
}
