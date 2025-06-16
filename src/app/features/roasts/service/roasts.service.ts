import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Tueste } from '../../../shared/models/tueste';
import { environment } from '../../../../enviroments/enviroment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RoastsService {

  private readonly baseUrl = `${environment.apiUrl}/tueste`;
  private readonly baseUrlP = `${environment.apiUrl}/p`;

  constructor(private http: HttpClient) {}

  

  getTuesteById(id: string): Observable<Tueste> {
    return this.http.get<Tueste>(`${this.baseUrl}/${id}`);
  }

  updateTueste(id: string, data: Tueste): Observable<Tueste> {
    return this.http.put<Tueste>(`${this.baseUrl}/${id}`, data);
  }


  getTuesteByFecha(fecha: string): Observable<Tueste[]> {
    return this.http.get<Tueste[]>(`${this.baseUrl}/fecha/${fecha}`);
  }

  getAllTuestes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrlP}`);
  }

  getTuestesByPedido(id: string): Observable<Tueste[]> {
    return this.http.get<Tueste[]>(`${this.baseUrl}/pedido/${id}`);
  }

  completarTostado(id:string, tueste:Tueste): Observable<Tueste> {
    return this.http.put<Tueste>(`${this.baseUrl}/c/${id}`, {tueste});
  }

}
