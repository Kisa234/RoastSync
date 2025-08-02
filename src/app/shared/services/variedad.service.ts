import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Variedad } from '../models/variedad';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable({ providedIn: 'root' })
export class VariedadService {
    constructor(
        private http: HttpClient
    ) { }
    private baseUrl = `${environment.apiUrl}/variedad`;

    createVariedad(data: Partial<Variedad>): Observable<Variedad> {
        return this.http.post<Variedad>(`${this.baseUrl}`, data);
    }

    updateVariedad(id: string, data: Partial<Variedad>): Observable<Variedad> {
        return this.http.put<Variedad>(`${this.baseUrl}/${id}`, data);
    }

    deleteVariedad(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    getAllVariedades(): Observable<Variedad[]> {
        return this.http.get<Variedad[]>(`${this.baseUrl}`);
    }

    getVariedadByNombre(nombre: string): Observable<Variedad> {
        return this.http.get<Variedad>(`${this.baseUrl}/${nombre}`);
    }


}
