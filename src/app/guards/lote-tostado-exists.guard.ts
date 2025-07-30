// src/app/shared/guards/lote-tostado-exists.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LoteTostadoService } from '../features/inventory/service/lote-tostado.service';
import { LoteTostado } from '../shared/models/lote-tostado';

@Injectable({ providedIn: 'root' })
export class LoteTostadoExistsGuard implements CanActivate {
  constructor(
    private loteTostadoSvc: LoteTostadoService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean | UrlTree> {
    const id = route.paramMap.get('id')!;

    return this.loteTostadoSvc.getAll().pipe(
      map((lotes: LoteTostado[]) =>
        lotes.some(l => l.id_lote_tostado === id)
          // si existe, permitimos la navegación
          ? true
          // si NO existe, devolvemos un UrlTree que redirige a /inventory
          : this.router.createUrlTree(['/inventory'])
      ),
      catchError(() =>
        // si falla la llamada (error de red, 500, etc), también redirigimos
        of(this.router.createUrlTree(['/inventory']))
      )
    );
  }
}
