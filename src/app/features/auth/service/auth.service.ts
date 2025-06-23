import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface LoginResp {
  accessToken: string;
  refreshToken: string;
  user: { id_user: string; email: string; rol: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResp> {
    return this.http
      .post<LoginResp>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(resp => {
          localStorage.setItem('access_token', resp.accessToken);
          localStorage.setItem('refresh_token', resp.refreshToken);
        })
      );
  }

  refreshAccessToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http
      .post<{ accessToken: string }>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        tap(r => {
          localStorage.setItem('access_token', r.accessToken);
        })
      );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // PARA TUS GUARDS: comprueba sesión llamando /me
  checkSession() {
    return this.http.get<{ id: string; email: string; rol: string }>(
      `${this.apiUrl}/me`
    );
  }
}
