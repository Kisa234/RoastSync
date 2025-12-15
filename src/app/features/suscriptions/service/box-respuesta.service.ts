import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BoxRespuesta } from '../../../shared/models/box-respuesta';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BoxRespuestaService {

  private baseUrl = `${environment.apiUrl}/box-respuesta`
  

  constructor(private http: HttpClient) {}

  create(data: BoxRespuesta): Observable<BoxRespuesta> {
    return this.http.post<BoxRespuesta>(`${this.baseUrl}`, data);
  }

  getByTemplate(id_box_template: string): Observable<BoxRespuesta[]> {
    return this.http.get<BoxRespuesta[]>(`${this.baseUrl}/template/${id_box_template}`);
  }

  getByUser(id_user: string): Observable<BoxRespuesta[]> {
    return this.http.get<BoxRespuesta[]>(`${this.baseUrl}/user/${id_user}`);
  }

  getById(id: string): Observable<BoxRespuesta> {
    return this.http.get<BoxRespuesta>(`${this.baseUrl}/${id}`);
  }

  update(id: string, data: Partial<BoxRespuesta>): Observable<BoxRespuesta> {
    return this.http.put<BoxRespuesta>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
