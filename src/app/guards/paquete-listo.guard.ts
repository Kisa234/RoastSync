import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { PaqueteService } from '../features/envios/service/paquete.service';
import { UiService } from '../shared/services/ui.service';
import { EstadoPaquete } from '../shared/enum/estado-paquete.enum';
import { EstadoEnvio } from '../shared/enum/estado-envio.enum';

/**
 * Bloquea /envios/nuevo/:id_paquete si el paquete no está LISTO o si ya tiene
 * un envío activo (no CANCELADO ni DEVUELTO) — evita crear un segundo envío
 * activo sobre el mismo paquete al volver atrás en el navegador.
 */
export const paqueteListoGuard: CanActivateFn = (route) => {
  const paqueteSvc = inject(PaqueteService);
  const uiSvc = inject(UiService);
  const router = inject(Router);

  const idPaquete = route.paramMap.get('id_paquete');
  if (!idPaquete) return router.createUrlTree(['/envios']);

  return paqueteSvc.getById(idPaquete).pipe(
    map(paquete => {
      const envioActivo = (paquete.envios ?? []).find(
        e => e.estado !== EstadoEnvio.CANCELADO && e.estado !== EstadoEnvio.DEVUELTO
      );

      if (envioActivo) {
        uiSvc.alert('warning', 'Envío ya existe', 'Este paquete ya tiene un envío activo registrado.');
        return router.createUrlTree(['/envios', envioActivo.id_envio]);
      }
      if (paquete.estado !== EstadoPaquete.LISTO) {
        uiSvc.alert('warning', 'No disponible', 'Este paquete no está en estado Listo.');
        return router.createUrlTree(['/envios/paquete', idPaquete]);
      }
      return true;
    }),
    catchError(() => {
      uiSvc.alert('error', 'Error', 'No se pudo verificar el paquete.');
      return of(router.createUrlTree(['/envios']));
    })
  );
};