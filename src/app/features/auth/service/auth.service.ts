import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../enviroments/enviroment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/user`;
  private accessToken: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }, { withCredentials: true } );
  }

  refreshAccessToken() {
    return this.http.get<{ accessToken: string }>(`${this.apiUrl}/refresh`, { withCredentials: true });
  }

  setToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return this.accessToken || localStorage.getItem('access_token');
  }

  logout() {
    localStorage.removeItem('access_token');
    this.accessToken = null;
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();

    if (!token) return false;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // `exp` está en segundos
    return Date.now() < exp;
  }
}
