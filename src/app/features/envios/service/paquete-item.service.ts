import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaqueteItem } from '../../../shared/models/paquete-item';

@Injectable({ providedIn: 'root' })
export class PaqueteItemService {
  private readonly baseUrl = `${environment.apiUrl}/paquete-item`;

  constructor(private http: HttpClient) {}

  getByPaquete(id_paquete: string): Observable<PaqueteItem[]> {
    return this.http.get<PaqueteItem[]>(`${this.baseUrl}/paquete/${id_paquete}`);
  }

  getById(id_item: string): Observable<PaqueteItem> {
    return this.http.get<PaqueteItem>(`${this.baseUrl}/${id_item}`);
  }
}