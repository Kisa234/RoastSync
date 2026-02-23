import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CategoriaInsumo } from '../../../../shared/models/categoria-insumo';

@Injectable({
  providedIn: 'root'
})
export class CategoriaInsumoService {

  private apiUrl = `${environment.apiUrl}/categoria-insumo`;

  constructor(private http: HttpClient) {}

  // 🔹 Obtener todas
  getAll(): Observable<CategoriaInsumo[]> {
    return this.http.get<CategoriaInsumo[]>(this.apiUrl);
  }

  // 🔹 Obtener por ID
  getById(id: string): Observable<CategoriaInsumo> {
    return this.http.get<CategoriaInsumo>(`${this.apiUrl}/${id}`);
  }

  // 🔹 Crear
  create(data: Partial<CategoriaInsumo>): Observable<CategoriaInsumo> {
    return this.http.post<CategoriaInsumo>(this.apiUrl, data);
  }

  // 🔹 Actualizar
  update(id: string, data: Partial<CategoriaInsumo>): Observable<CategoriaInsumo> {
    return this.http.put<CategoriaInsumo>(`${this.apiUrl}/${id}`, data);
  }

  // 🔹 Eliminar
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}