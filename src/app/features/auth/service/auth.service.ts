import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

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

  checkSession() {
    return this.http.get<{ id: string, email: string, rol: string }>(`${this.apiUrl}/me`, {
      withCredentials: true
    });
  }

  logout() {
    localStorage.removeItem('access_token');
    this.accessToken = null;
    this.router.navigate(['/auth/login']);
  }

}
