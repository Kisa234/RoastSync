import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BoxOpcionModel } from '../../../shared/models/box-opcion';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BoxOpcionService {

  private baseUrl = `${environment.apiUrl}/box-opcion`

  constructor(private http: HttpClient) {}

  create(data: Partial<BoxOpcionModel>): Observable<BoxOpcionModel> {
    return this.http.post<BoxOpcionModel>(`${this.baseUrl}`, data);
  }

  getByTemplate(id_box_template: string): Observable<BoxOpcionModel[]> {
    return this.http.get<BoxOpcionModel[]>(`${this.baseUrl}/template/${id_box_template}`);
  }

  getById(id: string): Observable<BoxOpcionModel> {
    return this.http.get<BoxOpcionModel>(`${this.baseUrl}/${id}`);
  }

  update(id: string, data: Partial<BoxOpcionModel>): Observable<BoxOpcionModel> {
    return this.http.put<BoxOpcionModel>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
