import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CategoriaInsumoService } from '../../features/inventory/insumo/service/categoria-insumo.service';

@Pipe({
  name: 'CategoriaInsumoNamePipe',
  standalone: true,
  pure: true
})
export class CategoriaInsumoPipe implements PipeTransform {
  constructor(private categoriaInsumoService: CategoriaInsumoService) {}

  transform(idCategoria: string | null | undefined): Observable<string> {
    if (!idCategoria) {
      return of('');
    }

    return this.categoriaInsumoService.getById(idCategoria).pipe(
      map(categoria => categoria?.nombre ?? 'Sin categoría'),
      catchError(() => of('Sin categoría'))
    );
  }
}