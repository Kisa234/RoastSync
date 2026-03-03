import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Almacen, CreateAlmacenDto, UpdateAlmacenDto } from '../../../../shared/models/almacen';


@Injectable({ providedIn: 'root' })
export class AlmacenService {
  private baseUrl = `${environment.apiUrl}/almacen`;

  constructor(private http: HttpClient) { }

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



  //FUNCIONES CON CACHE 

  // FUNCIONES CON CACHE 
  private cache = new Map<string, Observable<string>>();

  getNombre(idAlmacen: string | null | undefined): Observable<string> {
    if (!idAlmacen) return of('N/A');

    const hit = this.cache.get(idAlmacen);
    if (hit) return hit;

    const req$ = this.getAlmacenById(idAlmacen).pipe(
      map(a => {
        if (!a || !a.nombre) return 'N/A';
        return a.nombre;
      }),
      catchError(() => of('N/A')),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.cache.set(idAlmacen, req$);
    return req$;
  }

}
