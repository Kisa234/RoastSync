import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Paquete,
  PaqueteConItems,
  CreatePaquete,
  MarcarListoPaquete,
  CancelarPaquete,
} from '../../../shared/models/paquete';
import { PaqueteItem, CreatePaqueteItem } from '../../../shared/models/paquete-item';

@Injectable({ providedIn: 'root' })
export class PaqueteService {
  private readonly baseUrl = `${environment.apiUrl}/paquete`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Paquete[]> {
    return this.http.get<Paquete[]>(`${this.baseUrl}`);
  }

  getById(id_paquete: string): Observable<PaqueteConItems> {
    return this.http.get<PaqueteConItems>(`${this.baseUrl}/${id_paquete}`);
  }

  getByPedidoOrigen(id_pedido: string): Observable<Paquete | null> {
    return this.http.get<Paquete | null>(`${this.baseUrl}/pedido-origen/${id_pedido}`);
  }

  create(data: CreatePaquete): Observable<Paquete> {
    return this.http.post<Paquete>(`${this.baseUrl}`, data);
  }

  addItem(id_paquete: string, data: CreatePaqueteItem): Observable<PaqueteItem> {
    return this.http.post<PaqueteItem>(`${this.baseUrl}/${id_paquete}/items`, data);
  }

  removeItem(id_paquete: string, id_item: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id_paquete}/items/${id_item}`);
  }

  marcarListo(id_paquete: string, data: MarcarListoPaquete): Observable<Paquete> {
    return this.http.put<Paquete>(`${this.baseUrl}/${id_paquete}/listo`, data);
  }

  cancelar(id_paquete: string, data: CancelarPaquete): Observable<Paquete> {
    return this.http.put<Paquete>(`${this.baseUrl}/${id_paquete}/cancelar`, data);
  }
}