import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CategoriaProductoService } from '../../features/inventory/products/service/categoria-producto.service';

@Pipe({
  name: 'CategoriaProductoNamePipe',
  standalone: true,
  pure: true
})
export class CategoriaNombrePipe implements PipeTransform {
  constructor(private categoriaSvc: CategoriaProductoService) {}

  transform(id: string | null | undefined): Observable<string> {
    if (!id) return of('');

    return this.categoriaSvc.getCategoriaById(id).pipe(
      map(categoria => this.capitalizeWords(categoria?.nombre ?? id))
    );
  }

  private capitalizeWords(text: string): string {
    if (!text) return '';
    return text
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
}