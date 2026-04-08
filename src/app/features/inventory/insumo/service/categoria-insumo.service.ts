import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { CategoriaInsumo } from '../../../../shared/models/categoria-insumo';

@Injectable({
  providedIn: 'root'
})
export class CategoriaInsumoService {
  private apiUrl = `${environment.apiUrl}/categoria-insumo`;

  private categoriaCache = new Map<string, CategoriaInsumo>();
  private categoriaRequestCache = new Map<string, Observable<CategoriaInsumo>>();

  constructor(private http: HttpClient) {}

  // Obtener todas
  getAll(): Observable<CategoriaInsumo[]> {
    return this.http.get<CategoriaInsumo[]>(this.apiUrl);
  }

  // Obtener por ID con cache
  getById(id: string): Observable<CategoriaInsumo> {
    if (!id) {
      return of({} as CategoriaInsumo);
    }

    const cached = this.categoriaCache.get(id);
    if (cached) {
      return of(cached);
    }

    const pending = this.categoriaRequestCache.get(id);
    if (pending) {
      return pending;
    }

    const request$ = this.http.get<CategoriaInsumo>(`${this.apiUrl}/${id}`).pipe(
      tap(categoria => {
        this.categoriaCache.set(id, categoria);
        this.categoriaRequestCache.delete(id);
      }),
      shareReplay(1)
    );

    this.categoriaRequestCache.set(id, request$);
    return request$;
  }

  // Alias opcional para mantener consistencia con otros services
  getCategoriaById(id: string): Observable<CategoriaInsumo> {
    return this.getById(id);
  }

  // Crear
  create(data: Partial<CategoriaInsumo>): Observable<CategoriaInsumo> {
    return this.http.post<CategoriaInsumo>(this.apiUrl, data);
  }

  // Actualizar
  update(id: string, data: Partial<CategoriaInsumo>): Observable<CategoriaInsumo> {
    return this.http.put<CategoriaInsumo>(`${this.apiUrl}/${id}`, data).pipe(
      tap(categoriaActualizada => {
        this.categoriaCache.set(id, categoriaActualizada);
        this.categoriaRequestCache.delete(id);
      })
    );
  }

  // Eliminar
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.categoriaCache.delete(id);
        this.categoriaRequestCache.delete(id);
      })
    );
  }

  clearCategoriaInsumoCache(): void {
    this.categoriaCache.clear();
    this.categoriaRequestCache.clear();
  }
}