import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { InventarioBolsa } from '../../../../shared/models/bolsa';

@Injectable({ providedIn: 'root' })
export class InventarioBolsaService {
  private baseUrl = `${environment.apiUrl}/inventario-bolsa`;

  constructor(private http: HttpClient) {}

  create(data: Partial<InventarioBolsa>): Observable<InventarioBolsa> {
    return this.http.post<InventarioBolsa>(this.baseUrl, data);
  }

  getAll(): Observable<InventarioBolsa[]> {
    return this.http.get<InventarioBolsa[]>(this.baseUrl);
  }

  getByBolsa(idBolsa: string): Observable<InventarioBolsa[]> {
    return this.http.get<InventarioBolsa[]>(`${this.baseUrl}/bolsa/${idBolsa}`);
  }

  getByAlmacen(idAlmacen: string): Observable<InventarioBolsa[]> {
    return this.http.get<InventarioBolsa[]>(`${this.baseUrl}/almacen/${idAlmacen}`);
  }

  getByBolsaAndAlmacen(idBolsa: string, idAlmacen: string): Observable<InventarioBolsa> {
    return this.http.get<InventarioBolsa>(`${this.baseUrl}/bolsa/${idBolsa}/almacen/${idAlmacen}`);
  }

  update(idInventario: string, data: Partial<InventarioBolsa>): Observable<InventarioBolsa> {
    return this.http.put<InventarioBolsa>(`${this.baseUrl}/${idInventario}`, data);
  }
}