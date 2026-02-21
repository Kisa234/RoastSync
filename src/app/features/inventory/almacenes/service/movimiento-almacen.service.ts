import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CreateMovimientoDto, EntidadInventario, MovimientoAlmacen } from '../../../../shared/models/movimiento-almacen';

@Injectable({ providedIn: 'root' })
export class MovimientoAlmacenService {
  private baseUrl = `${environment.apiUrl}/movimiento-almacen`;

  constructor(private http: HttpClient) {}

  // GET /movimiento-almacen/entidad/:entidad/:id_entidad
  getMovimientosByEntidad(entidad: EntidadInventario, idEntidad: string): Observable<MovimientoAlmacen[]> {
    return this.http.get<MovimientoAlmacen[]>(`${this.baseUrl}/entidad/${entidad}/${idEntidad}`);
  }

  // GET /movimiento-almacen/almacen/:id_almacen
  getMovimientosByAlmacen(idAlmacen: string): Observable<MovimientoAlmacen[]> {
    return this.http.get<MovimientoAlmacen[]>(`${this.baseUrl}/almacen/${idAlmacen}`);
  }

  // GET /movimiento-almacen/rango-fecha?fechaInicio=...&fechaFin=...&id_almacen=... (depende tu controller)
  // Como tu route es /rango-fecha (query params), lo dejamos flexible:
  getMovimientosByFechaRange(params: { [key: string]: string | number | boolean }): Observable<MovimientoAlmacen[]> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) httpParams = httpParams.set(k, String(v));
    });

    return this.http.get<MovimientoAlmacen[]>(`${this.baseUrl}/rango-fecha`, { params: httpParams });
  }

  // POST /movimiento-almacen
  createMovimiento(dto: CreateMovimientoDto): Observable<MovimientoAlmacen> {
    return this.http.post<MovimientoAlmacen>(`${this.baseUrl}`, dto);
  }

  // GET /movimiento-almacen
  getAllMovimientos(): Observable<MovimientoAlmacen[]> {
    return this.http.get<MovimientoAlmacen[]>(`${this.baseUrl}`);
  }

  // GET /movimiento-almacen/:id_movimiento
  getMovimientoById(idMovimiento: string): Observable<MovimientoAlmacen> {
    return this.http.get<MovimientoAlmacen>(`${this.baseUrl}/${idMovimiento}`);
  }
}
