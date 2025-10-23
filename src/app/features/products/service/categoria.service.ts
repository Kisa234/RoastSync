import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Categoria } from '../../../shared/models/categoria';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private base = `${environment.apiUrl}/categoria`;

  constructor(private http: HttpClient) {}

  /** Obtener todas las categorías */
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.base);
  }

  /** Obtener una categoría por ID */
  getCategoriaById(id: string): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.base}/${id}`);
  }

  /** Crear una nueva categoría */
  createCategoria(data: Partial<Categoria>): Observable<Categoria> {
    return this.http.post<Categoria>(this.base, data);
  }

  /** Actualizar una categoría existente */
  updateCategoria(id: string, data: Partial<Categoria>): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.base}/${id}`, data);
  }

  /** Eliminar una categoría */
  deleteCategoria(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
