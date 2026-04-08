import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AjustarStockPayload, Almacen, CreateAlmacenDto, TrasladarStockPayload, UpdateAlmacenDto } from '../../../../shared/models/almacen';

@Injectable({ providedIn: 'root' })
export class AlmacenService {
  private baseUrl = `${environment.apiUrl}/almacen`;

  private almacenCache = new Map<string, Almacen>();
  private almacenRequestCache = new Map<string, Observable<Almacen>>();
  private nombreCache = new Map<string, Observable<string>>();

  constructor(private http: HttpClient) { }

  ajustarStock(payload: AjustarStockPayload) {
    return this.http.post<{ message: string }>(`${this.baseUrl}/ajustar-stock`, payload);
  }

  trasladarStock(payload: TrasladarStockPayload) {
    return this.http.post<{ message: string }>(`${this.baseUrl}/trasladar-stock`, payload);
  }


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

  // GET /almacen/:id_almacen con cache
  getAlmacenById(idAlmacen: string): Observable<Almacen> {
    if (!idAlmacen) {
      return of({} as Almacen);
    }

    const cached = this.almacenCache.get(idAlmacen);
    if (cached) {
      return of(cached);
    }

    const pending = this.almacenRequestCache.get(idAlmacen);
    if (pending) {
      return pending;
    }

    const request$ = this.http.get<Almacen>(`${this.baseUrl}/${idAlmacen}`).pipe(
      tap(almacen => {
        this.almacenCache.set(idAlmacen, almacen);
        this.almacenRequestCache.delete(idAlmacen);
      }),
      shareReplay(1)
    );

    this.almacenRequestCache.set(idAlmacen, request$);
    return request$;
  }

  // PATCH /almacen/:id_almacen
  updateAlmacen(idAlmacen: string, dto: UpdateAlmacenDto): Observable<Almacen> {
    return this.http.patch<Almacen>(`${this.baseUrl}/${idAlmacen}`, dto).pipe(
      tap(almacenActualizado => {
        this.almacenCache.set(idAlmacen, almacenActualizado);
        this.almacenRequestCache.delete(idAlmacen);
        this.nombreCache.delete(idAlmacen);
      })
    );
  }

  // DELETE /almacen/:id_almacen
  deleteAlmacen(idAlmacen: string): Observable<{ ok: boolean; message?: string }> {
    return this.http.delete<{ ok: boolean; message?: string }>(`${this.baseUrl}/${idAlmacen}`).pipe(
      tap(() => {
        this.almacenCache.delete(idAlmacen);
        this.almacenRequestCache.delete(idAlmacen);
        this.nombreCache.delete(idAlmacen);
      })
    );
  }

  // Nombre con cache
  getNombre(idAlmacen: string | null | undefined): Observable<string> {
    if (!idAlmacen) return of('N/A');

    const hit = this.nombreCache.get(idAlmacen);
    if (hit) return hit;

    const req$ = this.getAlmacenById(idAlmacen).pipe(
      map(a => a?.nombre || 'N/A'),
      catchError(() => of('N/A')),
      shareReplay(1)
    );

    this.nombreCache.set(idAlmacen, req$);
    return req$;
  }

  clearAlmacenCache(): void {
    this.almacenCache.clear();
    this.almacenRequestCache.clear();
    this.nombreCache.clear();
  }



}