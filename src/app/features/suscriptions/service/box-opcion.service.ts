import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BoxOpcion } from '../../../shared/models/box-opcion';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BoxOpcionService {

  private baseUrl = `${environment.apiUrl}/box-opcion`

  constructor(private http: HttpClient) {}

  create(data: Partial<BoxOpcion>): Observable<BoxOpcion> {
    return this.http.post<BoxOpcion>(`${this.baseUrl}`, data);
  }

  getByTemplate(id_box_template: string): Observable<BoxOpcion[]> {
    return this.http.get<BoxOpcion[]>(`${this.baseUrl}/template/${id_box_template}`);
  }

  getById(id: string): Observable<BoxOpcion> {
    return this.http.get<BoxOpcion>(`${this.baseUrl}/${id}`);
  }

  update(id: string, data: Partial<BoxOpcion>): Observable<BoxOpcion> {
    return this.http.put<BoxOpcion>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
