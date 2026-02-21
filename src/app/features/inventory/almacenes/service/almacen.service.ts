import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Almacen, CreateAlmacenDto, UpdateAlmacenDto } from '../../../../shared/models/almacen';


@Injectable({ providedIn: 'root' })
export class AlmacenService {
  private baseUrl = `${environment.apiUrl}/almacen`;

  constructor(private http: HttpClient) {}

  // GET /almacen/activos
  getAlmacenesActivos(): Observable<Almacen[]> {
    return this.http.get<Almacen[]>(`${this.baseUrl}/activos`);
  }

  // POST /almacen
  createAlmacen(dto: CreateAlmacenDto): Observable<Almacen> {
    return this.http.post<Almacen>(`${this.baseUrl}`, dto);
  }

  // GET /almacen
  getAllAlmacenes(): Observable<Almacen[]> {
    return this.http.get<Almacen[]>(`${this.baseUrl}`);
  }

  // GET /almacen/:id_almacen
  getAlmacenById(idAlmacen: string): Observable<Almacen> {
    return this.http.get<Almacen>(`${this.baseUrl}/${idAlmacen}`);
  }

  // PATCH /almacen/:id_almacen
  updateAlmacen(idAlmacen: string, dto: UpdateAlmacenDto): Observable<Almacen> {
    return this.http.patch<Almacen>(`${this.baseUrl}/${idAlmacen}`, dto);
  }

  // DELETE /almacen/:id_almacen
  deleteAlmacen(idAlmacen: string): Observable<{ ok: boolean; message?: string }> {
    return this.http.delete<{ ok: boolean; message?: string }>(`${this.baseUrl}/${idAlmacen}`);
  }
}
