import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { Categoria } from '../../../../shared/models/categoria';

@Injectable({
  providedIn: 'root'
})
export class CategoriaProductoService {
  private base = `${environment.apiUrl}/categoria`;

  private categoriaCache = new Map<string, Categoria>();
  private categoriaRequestCache = new Map<string, Observable<Categoria>>();

  constructor(private http: HttpClient) {}

  /** Obtener todas las categorías */
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.base);
  }

  /** Obtener una categoría por ID con cache */
  getCategoriaById(id: string): Observable<Categoria> {
    if (!id) {
      return of({} as Categoria);
    }

    const cached = this.categoriaCache.get(id);
    if (cached) {
      return of(cached);
    }

    const pending = this.categoriaRequestCache.get(id);
    if (pending) {
      return pending;
    }

    const request$ = this.http.get<Categoria>(`${this.base}/${id}`).pipe(
      tap(categoria => {
        this.categoriaCache.set(id, categoria);
        this.categoriaRequestCache.delete(id);
      }),
      shareReplay(1)
    );

    this.categoriaRequestCache.set(id, request$);
    return request$;
  }

  /** Crear una nueva categoría */
  createCategoria(data: Partial<Categoria>): Observable<Categoria> {
    return this.http.post<Categoria>(this.base, data);
  }

  /** Actualizar una categoría existente */
  updateCategoria(id: string, data: Partial<Categoria>): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.base}/${id}`, data).pipe(
      tap(categoriaActualizada => {
        this.categoriaCache.set(id, categoriaActualizada);
        this.categoriaRequestCache.delete(id);
      })
    );
  }

  /** Eliminar una categoría */
  deleteCategoria(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(
      tap(() => {
        this.categoriaCache.delete(id);
        this.categoriaRequestCache.delete(id);
      })
    );
  }

  clearCategoriaCache(): void {
    this.categoriaCache.clear();
    this.categoriaRequestCache.clear();
  }
}