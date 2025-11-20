import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BoxRespuestaModel } from '../../../shared/models/box-respuesta';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BoxRespuestaService {

  private baseUrl = `${environment.apiUrl}/box-respuesta`
  

  constructor(private http: HttpClient) {}

  create(data: BoxRespuestaModel): Observable<BoxRespuestaModel> {
    return this.http.post<BoxRespuestaModel>(`${this.baseUrl}`, data);
  }

  getByTemplate(id_box_template: string): Observable<BoxRespuestaModel[]> {
    return this.http.get<BoxRespuestaModel[]>(`${this.baseUrl}/template/${id_box_template}`);
  }

  getByUser(id_user: string): Observable<BoxRespuestaModel[]> {
    return this.http.get<BoxRespuestaModel[]>(`${this.baseUrl}/user/${id_user}`);
  }

  getById(id: string): Observable<BoxRespuestaModel> {
    return this.http.get<BoxRespuestaModel>(`${this.baseUrl}/${id}`);
  }

  update(id: string, data: Partial<BoxRespuestaModel>): Observable<BoxRespuestaModel> {
    return this.http.put<BoxRespuestaModel>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
