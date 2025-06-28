// File: analisis-defectos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AnalisisDefectos } from '../../../shared/models/analisis-defectos';

@Injectable({
    providedIn: 'root'
})
export class AnalisisDefectosService {

    private baseUrl = `${environment.apiUrl}/analisisDefectos`;

    constructor(private http: HttpClient) { }

    createAnalisis(data: AnalisisDefectos, id_lote: string, type: string): Observable<AnalisisDefectos> {
        return this.http.post<AnalisisDefectos>(`${this.baseUrl}/${id_lote}/${type}`, data);
    }
    getAnalisisById(id: string): Observable<AnalisisDefectos> {
        return this.http.get<AnalisisDefectos>(`${this.baseUrl}/${id}`);
    }
    updateAnalisis(id_lote: string, data: AnalisisDefectos, type: string): Observable<AnalisisDefectos> {
        return this.http.put<AnalisisDefectos>(`${this.baseUrl}/${id_lote}/${type}`, data);
    }
    

    
}
