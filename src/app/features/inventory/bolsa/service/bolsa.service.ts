import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Bolsa, BolsaConInventario } from '../../../../shared/models/bolsa';

@Injectable({ providedIn: 'root' })
export class BolsaService {
  private baseUrl = `${environment.apiUrl}/bolsa`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Bolsa[]> {
    return this.http.get<Bolsa[]>(this.baseUrl);
  }

  getById(id: string): Observable<Bolsa> {
    return this.http.get<Bolsa>(`${this.baseUrl}/${id}`);
  }

  getConInventario(): Observable<BolsaConInventario[]> {
    return this.http.get<BolsaConInventario[]>(`${this.baseUrl}/inventario`);
  }

  getConInventarioById(id: string): Observable<BolsaConInventario> {
    return this.http.get<BolsaConInventario>(`${this.baseUrl}/inventario/${id}`);
  }

  getByPedido(idPedido: string): Observable<Bolsa[]> {
    return this.http.get<Bolsa[]>(`${this.baseUrl}/pedido/${idPedido}`);
  }

  getByLoteTostado(idLoteTostado: string): Observable<Bolsa[]> {
    return this.http.get<Bolsa[]>(`${this.baseUrl}/lote-tostado/${idLoteTostado}`);
  }

  update(id: string, data: Partial<Bolsa>): Observable<Bolsa> {
    return this.http.put<Bolsa>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}