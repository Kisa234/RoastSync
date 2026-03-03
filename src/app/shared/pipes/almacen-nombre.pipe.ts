import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { AlmacenService } from '../../features/inventory/almacenes/service/almacen.service';

@Pipe({
  name: 'almacenNombre',
  standalone: true,
  pure: true,
})
export class AlmacenNombrePipe implements PipeTransform {
  constructor(private readonly almacenService: AlmacenService) {}

  transform(idAlmacen: string | null | undefined): Observable<string> {
    return this.almacenService.getNombre(idAlmacen);
  }
}