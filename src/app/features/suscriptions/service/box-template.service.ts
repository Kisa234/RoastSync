import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BoxTemplateModel } from '../../../shared/models/box-template';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BoxTemplateService {

  private baseUrl = `${environment.apiUrl}/box-template`

  constructor(private http: HttpClient) {}

  create(data: BoxTemplateModel): Observable<BoxTemplateModel> {
    return this.http.post<BoxTemplateModel>(`${this.baseUrl}`, data);
  }

  getAll(): Observable<BoxTemplateModel[]> {
    return this.http.get<BoxTemplateModel[]>(`${this.baseUrl}`);
  }

  getById(id: string): Observable<BoxTemplateModel> {
    return this.http.get<BoxTemplateModel>(`${this.baseUrl}/${id}`);
  }

  update(id: string, data: Partial<BoxTemplateModel>): Observable<BoxTemplateModel> {
    return this.http.put<BoxTemplateModel>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  setActiveTemplate(id: string) {
    return this.http.post(`${this.baseUrl}/set-active/${id}`, {});
  }
}
