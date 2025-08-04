import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import {
  DepartamentoRaw,
  ProvinciaRaw,
  Departamento,
  Provincia
} from '../models/ubigeo';

interface DepartamentosResponse {
  ubigeo_departamentos: DepartamentoRaw[];
}

interface ProvinciasResponse {
  ubigeo_provincias: ProvinciaRaw[];
}

@Injectable({ providedIn: 'root' })
export class UbigeoService {
  private basePath = 'assets/json/ubigeo';

  // cache departaments
  private _deps$?: Observable<Departamento[]>;

  constructor(private http: HttpClient) {}

  /** Obtiene y mapea Departamentos */
  getDepartamentos(): Observable<Departamento[]> {
    if (!this._deps$) {
      this._deps$ = this.http
        .get<DepartamentosResponse>(`${this.basePath}/1_ubigeo_departamentos.json`)
        .pipe(
          map(resp =>
            resp.ubigeo_departamentos.map(d => ({
              id:     d.id,
              nombre: d.departamento,
              codigo: d.ubigeo
            }))
          ),
          shareReplay(1)
        );
    }
    return this._deps$;
  }

  /** Obtiene y filtra Provincias por el código de departamento */
  getProvincias(deptoCodigo: string): Observable<Provincia[]> {
    return this.http
      .get<ProvinciasResponse>(`${this.basePath}/2_ubigeo_provincias.json`)
      .pipe(
        map(resp =>
          resp.ubigeo_provincias
            .filter(p => p.ubigeo.startsWith(deptoCodigo))
            .map(p => ({
              id:            p.id,
              nombre:        p.provincia,
              codigo:        p.ubigeo,
              departamentoId: p.departamento_id
            }))
        )
      );
  }
}
