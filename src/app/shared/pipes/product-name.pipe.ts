import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductoService } from '../../features/inventory/products/service/producto.service';

@Pipe({
  name: 'ProductNamePipe',
  standalone: true,
  pure: true
})
export class ProductoNombrePipe implements PipeTransform {
  constructor(private productoSvc: ProductoService) {}

  transform(id: string | null | undefined): Observable<string> {
    if (!id) return of('');

    return this.productoSvc.getProductoById(id).pipe(
      map(producto => this.capitalizeWords(producto?.nombre ?? id))
    );
  }

  private capitalizeWords(sentence: string): string {
    if (!sentence) return '';
    return sentence
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
}