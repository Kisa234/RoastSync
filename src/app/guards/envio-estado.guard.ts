import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { EnviosService } from '../features/envios/service/envios.service';
import { UiService } from '../shared/services/ui.service';

/**
 * Bloquea el acceso a una página de acción de Envío (programar, despachar, etc.)
 * si el envío ya avanzó a un estado donde esa acción no corresponde — evita el bug
 * de volver atrás en el navegador y reintentar un paso ya superado.
 *
 * Uso: data: { estadosPermitidos: ['PENDIENTE'] }
 */
export const envioEstadoGuard: CanActivateFn = (route) => {
  const enviosSvc = inject(EnviosService);
  const uiSvc = inject(UiService);
  const router = inject(Router);

  const idEnvio = route.paramMap.get('id');
  const estadosPermitidos = (route.data['estadosPermitidos'] as string[]) || [];

  if (!idEnvio) return router.createUrlTree(['/envios']);

  return enviosSvc.getEnvioById(idEnvio).pipe(
    map(envio => {
      if (estadosPermitidos.includes(envio.estado)) return true;

      uiSvc.alert('warning', 'No disponible',
        `Esta acción ya no aplica — el envío está en estado "${envio.estado}".`);
      return router.createUrlTree(['/envios', idEnvio]);
    }),
    catchError(() => {
      uiSvc.alert('error', 'Error', 'No se pudo verificar el envío.');
      return of(router.createUrlTree(['/envios']));
    })
  );
};