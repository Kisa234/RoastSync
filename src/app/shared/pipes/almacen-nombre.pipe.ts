import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AlmacenService } from '../../features/inventory/almacenes/service/almacen.service';

@Pipe({
  name: 'AlmacenNamePipe',
  standalone: true,
  pure: true,
})
export class AlmacenNombrePipe implements PipeTransform {
  constructor(private readonly almacenService: AlmacenService) {}

  transform(idAlmacen: string | null | undefined): Observable<string> {
    if (!idAlmacen) return of('');
    return this.almacenService.getNombre(idAlmacen);
  }
}