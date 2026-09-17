import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Envio, EnvioConDetalle, CreateEnvio, ProgramarEnvio, DespacharEnvio, ConfirmarEntregaEnvio, CancelarEnvio, RegistrarDevolucionEnvio,
} from '../../../shared/models/envio';

@Injectable({ providedIn: 'root' })
export class EnviosService {
  private readonly baseUrl = `${environment.apiUrl}/envio`;

  constructor(private http: HttpClient) { }

  // ---- Lectura ----
  getAllEnvios(): Observable<Envio[]> {
    return this.http.get<Envio[]>(`${this.baseUrl}`);
  }

  getEnvioById(id_envio: string): Observable<EnvioConDetalle> {
    return this.http.get<EnvioConDetalle>(`${this.baseUrl}/${id_envio}`);
  }

  // Paso 6: nace de un Paquete ya LISTO
  crearEnvio(data: CreateEnvio): Observable<Envio> {
    return this.http.post<Envio>(`${this.baseUrl}`, data);
  }

  // Paso 7 (opcional)
  programar(id_envio: string, data: ProgramarEnvio): Observable<Envio> {
    return this.http.put<Envio>(`${this.baseUrl}/${id_envio}/programar`, data);
  }

  // Paso 8 — acá recién se descuenta inventario real
  despachar(id_envio: string, data: DespacharEnvio): Observable<Envio> {
    return this.http.put<Envio>(`${this.baseUrl}/${id_envio}/despachar`, data);
  }

  // Paso 9
  confirmarEntrega(id_envio: string, data: ConfirmarEntregaEnvio): Observable<Envio> {
    return this.http.put<Envio>(`${this.baseUrl}/${id_envio}/entregar`, data);
  }

  // Solo válido en PENDIENTE/PROGRAMADO (nunca se descontó inventario)
  cancelar(id_envio: string, data: CancelarEnvio): Observable<Envio> {
    return this.http.put<Envio>(`${this.baseUrl}/${id_envio}/cancelar`, data);
  }

  // Solo válido desde DESPACHADO/EN_TRANSITO/ENTREGADO — reingresa stock
  registrarDevolucion(id_envio: string, data: RegistrarDevolucionEnvio): Observable<Envio> {
    return this.http.put<Envio>(`${this.baseUrl}/${id_envio}/devolucion`, data);
  }

  getEnviosPorEntidad(entidad: string, id_entidad: string): Observable<Envio[]> {
    return this.http.get<Envio[]>(`${this.baseUrl}/por-entidad/${entidad}/${id_entidad}`);
  }

  getByCliente(id_cliente: string): Observable<EnvioConDetalle[]> {
    return this.http.get<EnvioConDetalle[]>(`${this.baseUrl}/cliente/${id_cliente}`);
  }

}