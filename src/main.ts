import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideZoneChangeDetection } from '@angular/core';
import { appRoutes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TokenRefreshInterceptor } from './app/features/auth/service/token-refresh.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(
      withInterceptors([TokenRefreshInterceptor])
    )
  ]
})
.catch(err => console.error(err));