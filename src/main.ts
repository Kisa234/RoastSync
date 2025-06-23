import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app/app.routes';
import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import { authInterceptor } from './app/features/auth/service/auth.interceptor';
import { tokenRefreshInterceptor } from './app/features/auth/service/token-refresh.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(
      withInterceptors([
        authInterceptor,          
        tokenRefreshInterceptor   
      ])
    )
  ]
})
.catch(err => console.error(err));