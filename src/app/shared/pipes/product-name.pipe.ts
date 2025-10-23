import { Pipe, PipeTransform } from '@angular/core';
import { Producto } from '../models/producto';
import { ProductoService } from '../../features/products/service/producto.service';

@Pipe({
  name: 'productoNombre',
  pure: false
})
export class ProductoNombrePipe implements PipeTransform {
  private productoCache = new Map<string, Producto | null>();

  constructor(private productoSvc: ProductoService) {}

  transform(id: string): string {
    if (!id) return '';

    // Si no está en caché, lo pedimos al servicio
    if (!this.productoCache.has(id)) {
      this.productoCache.set(id, null); // Marcamos como "cargando"
      this.productoSvc.getProductoById(id).subscribe({
        next: (producto) => this.productoCache.set(id, producto),
        error: () => this.productoCache.delete(id)
      });
      return id; // Muestra temporalmente el ID hasta que llegue el nombre
    }

    const producto = this.productoCache.get(id);
    if (!producto) return id;

    // Devuelve el nombre capitalizado
    return this.capitalizeWords(producto.nombre);
  }

  private capitalizeWords(sentence: string): string {
    if (!sentence) return '';
    return sentence
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
}
