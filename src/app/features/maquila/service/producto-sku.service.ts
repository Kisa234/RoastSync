import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateProductoSku, ProductoSku, UpdateProductoSku } from '../../../shared/models/productoSku';

@Injectable({ providedIn: 'root' })
export class ProductoSkuService {
  private readonly baseUrl = `${environment.apiUrl}/sku`;

  constructor(private http: HttpClient) {}

  create(data: CreateProductoSku): Observable<ProductoSku> {
    return this.http.post<ProductoSku>(`${this.baseUrl}`, data);
  }

  list(): Observable<ProductoSku[]> {
    return this.http.get<ProductoSku[]>(`${this.baseUrl}`);
  }

  listByProducto(id_producto: string): Observable<ProductoSku[]> {
    return this.http.get<ProductoSku[]>(`${this.baseUrl}/producto/${id_producto}`);
  }

  listByLoteTostado(id_lote_tostado: string): Observable<ProductoSku[]> {
    return this.http.get<ProductoSku[]>(`${this.baseUrl}/lote-tostado/${id_lote_tostado}`);
  }

  getById(id: string): Observable<ProductoSku> {
    return this.http.get<ProductoSku>(`${this.baseUrl}/${id}`);
  }

  update(id: string, data: UpdateProductoSku): Observable<ProductoSku> {
    return this.http.patch<ProductoSku>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

