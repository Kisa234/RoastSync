import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app/app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';
import { tokenRefreshInterceptor } from './app/interceptors/token-refresh.interceptor';
import { authInterceptor } from './app/interceptors/auth.interceptor';

// 👉 Añadir estas dos líneas:
import { registerLocaleData } from '@angular/common';
import esPE from '@angular/common/locales/es-PE';

// 👉 Registrar el locale **antes** del bootstrap:
registerLocaleData(esPE);

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([authInterceptor, tokenRefreshInterceptor])),
    importProvidersFrom(
      NgxEchartsModule.forRoot({ echarts: () => import('echarts') })
    ),
    { provide: LOCALE_ID, useValue: 'es-PE' },
  ]
}).catch(err => console.error(err));
