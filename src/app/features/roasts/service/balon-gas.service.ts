import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

import {
  BalonGas,
  CreateBalonGasRequest,
  StartBalonGasRequest,
  FinalizeBalonGasRequest,
} from '../../../shared/models/balon-gas';

@Injectable({
  providedIn: 'root',
})
export class BalonGasService {

  private readonly baseUrl = `${environment.apiUrl}/balon-gas`;

  constructor(
    private readonly http: HttpClient,
  ) {}

  create(data: CreateBalonGasRequest): Observable<BalonGas> {
    return this.http.post<BalonGas>(`${this.baseUrl}`, data);
  }

  start(data: StartBalonGasRequest): Observable<BalonGas> {
    return this.http.post<BalonGas>(`${this.baseUrl}/start`, data);
  }

  finalize(data: FinalizeBalonGasRequest): Observable<BalonGas> {
    return this.http.post<BalonGas>(`${this.baseUrl}/finalize`, data);
  }

  getAll(): Observable<BalonGas[]> {
    return this.http.get<BalonGas[]>(`${this.baseUrl}`);
  }

  getActual(): Observable<BalonGas | null> {
    return this.http.get<BalonGas | null>(`${this.baseUrl}/actual`);
  }

  getById(id_balon_gas: string): Observable<BalonGas> {
    return this.http.get<BalonGas>(`${this.baseUrl}/${id_balon_gas}`);
  }
}