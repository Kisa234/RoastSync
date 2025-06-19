// src/app/features/users/service/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../../../shared/models/user';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  /** Obtiene todos los usuarios, opcionalmente filtrando por texto (nombre o email) */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  /** Obtiene un usuario por su ID */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  /** Obtiene usuarios según su rol */
  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/role/${role}`);
  }

  /** Crea un nuevo usuario */
  createUser(data: Partial<User>): Observable<User> {
    return this.http.post<User>(this.baseUrl, data);
  }

  /** Actualiza un usuario existente */
  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, data);
  }

  /** Elimina un usuario */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
