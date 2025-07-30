import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap, map, tap, catchError } from 'rxjs/operators';

import { LoteService } from '../../features/inventory/service/lote.service';
import { MuestraService } from '../../features/inventory/service/muestra.service';
import { AnalisisService } from '../../features/analysis/service/analisis.service';
import { AnalisisFisicoService } from '../../features/analysis/service/analisis-fisico.service';
import { AnalisisSensorialService } from '../../features/analysis/service/analisis-sensorial.service';
import { AnalisisDefectosService } from '../../features/analysis/service/analisis-defectos.service';
import { Analisis } from '../../shared/models/analisis';

@Injectable({ providedIn: 'root' })
export class AnalysisCompleteGuard implements CanActivate {
  constructor(
    private router: Router,
    private loteSvc: LoteService,
    private muestraSvc: MuestraService,
    private analisisSvc: AnalisisService,
    private afSvc: AnalisisFisicoService,
    private asSvc: AnalisisSensorialService,
    private adSvc: AnalisisDefectosService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const type = route.paramMap.get('type')!;
    const id = route.paramMap.get('id')!;

    // Decide qué flujo ejecutar
    const check$: Observable<boolean> =
      type === 'lote'
        ? this.checkLote(id)
        : type === 'muestra'
          ? this.checkMuestra(id)
          : of(false);

    return check$.pipe(
      tap(ok => {
        if (!ok) {
          this.router.navigate(['/inventory']);
        }
      }),
      catchError(() => {
        this.router.navigate(['/inventory']);
        return of(false);
      })
    );
  }

  /** Verifica que un lote tenga el análisis completo */
  private checkLote(id: string): Observable<boolean> {
    return this.loteSvc.getById(id).pipe(
      // Si no hay id_analisis, emitimos null
      switchMap(lote =>
        lote.id_analisis
          ? this.analisisSvc.getAnalisisById(lote.id_analisis)
          : of<Analisis | null>(null)
      ),
      // A partir de Analisis|null, decidimos si continuar
      switchMap(analisis => {
        if (
          !analisis?.analisisFisico_id ||
          !analisis.analisisSensorial_id ||
          !analisis.analisisDefectos_id
        ) {
          return of(false);
        }
        // Paraleleamos las 3 comprobaciones finales
        return forkJoin({
          fisico: this.afSvc.getAnalisisById(analisis.analisisFisico_id),
          sensorial: this.asSvc.getAnalisisById(analisis.analisisSensorial_id),
          defectos: this.adSvc.getAnalisisById(analisis.analisisDefectos_id)
        }).pipe(
          // Mapeamos al boolean de completitud
          map(res =>
            !!res.fisico && !!res.sensorial && !!res.defectos
          )
        );
      })
    );
  }

  /** Verifica que una muestra tenga el análisis completo */
  private checkMuestra(id: string): Observable<boolean> {
    return this.muestraSvc.getById(id).pipe(
      switchMap(muestra =>
        muestra.id_analisis
          ? this.analisisSvc.getAnalisisById(muestra.id_analisis)
          : of<Analisis | null>(null)
      ),
      switchMap(analisis => {
        if (
          !analisis?.analisisFisico_id ||
          !analisis.analisisSensorial_id ||
          !analisis.analisisDefectos_id
        ) {
          return of(false);
        }
        return forkJoin({
          fisico: this.afSvc.getAnalisisById(analisis.analisisFisico_id),
          sensorial: this.asSvc.getAnalisisById(analisis.analisisSensorial_id),
          defectos: this.adSvc.getAnalisisById(analisis.analisisDefectos_id)
        }).pipe(
          map(res =>
            !!res.fisico && !!res.sensorial && !!res.defectos
          )
        );
      })
    );
  }
}
