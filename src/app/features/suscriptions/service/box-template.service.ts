import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BoxTemplate } from '../../../shared/models/box-template';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BoxTemplateService {

  private baseUrl = `${environment.apiUrl}/box-template`

  constructor(private http: HttpClient) {}

  create(data: BoxTemplate): Observable<BoxTemplate> {
    return this.http.post<BoxTemplate>(`${this.baseUrl}`, data);
  }

  getAll(): Observable<BoxTemplate[]> {
    return this.http.get<BoxTemplate[]>(`${this.baseUrl}`);
  }

  getById(id: string): Observable<BoxTemplate> {
    return this.http.get<BoxTemplate>(`${this.baseUrl}/${id}`);
  }

  update(id: string, data: Partial<BoxTemplate>): Observable<BoxTemplate> {
    return this.http.put<BoxTemplate>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  setActiveTemplate(id: string) {
    return this.http.post(`${this.baseUrl}/set-active/${id}`, {});
  }

  getActiveTemplate(): Observable<BoxTemplate> {
    return this.http.get<BoxTemplate>(`${this.baseUrl}/active`);
  }

}
