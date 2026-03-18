import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { User } from '../../../shared/models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/user`;

  // cache de usuarios ya cargados
  private userCache = new Map<string, User>();

  // cache de peticiones en curso
  private userRequestCache = new Map<string, Observable<User>>();

  constructor(private http: HttpClient) {}

  /** Obtiene todos los usuarios, opcionalmente filtrando por texto (nombre o email) */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  /** Obtiene un usuario por su ID con cache */
  getUserById(id: string): Observable<User> {
    if (!id) {
      return of({} as User);
    }

    const cachedUser = this.userCache.get(id);
    if (cachedUser) {
      return of(cachedUser);
    }

    const pendingRequest = this.userRequestCache.get(id);
    if (pendingRequest) {
      return pendingRequest;
    }

    const request$ = this.http.get<User>(`${this.baseUrl}/${id}`).pipe(
      tap(user => {
        this.userCache.set(id, user);
        this.userRequestCache.delete(id);
      }),
      shareReplay(1)
    );

    this.userRequestCache.set(id, request$);
    return request$;
  }

  /** Obtiene usuarios según su rol */
  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/role/${role}`);
  }

  assignRoleToUser(idUser: string, idRol: string): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/user/${idUser}/role/${idRol}`, {});
  }

  /** Crea un nuevo usuario */
  createUser(data: Partial<User>): Observable<User> {
    return this.http.post<User>(this.baseUrl, data);
  }

  /** Actualiza un usuario existente */
  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, data).pipe(
      tap(userActualizado => {
        this.userCache.set(id, userActualizado);
        this.userRequestCache.delete(id);
      })
    );
  }

  /** Elimina un usuario */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.userCache.delete(id);
        this.userRequestCache.delete(id);
      })
    );
  }

  /** Limpia el cache manualmente */
  clearUserCache(): void {
    this.userCache.clear();
    this.userRequestCache.clear();
  }
}