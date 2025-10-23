import { Pipe, PipeTransform } from '@angular/core';
import { Categoria } from '../models/categoria';
import { CategoriaService } from '../../features/products/service/categoria.service';

@Pipe({
  name: 'categoriaNombre',
  pure: false
})
export class CategoriaNombrePipe implements PipeTransform {
  private cache = new Map<string, Categoria | null>();

  constructor(private categoriaSvc: CategoriaService) {}

  transform(id: string): string {
    if (!id) return '';

    // Si no está cacheada, la cargamos
    if (!this.cache.has(id)) {
      this.cache.set(id, null);
      this.categoriaSvc.getCategoriaById(id).subscribe({
        next: (res) => this.cache.set(id, res),
        error: () => this.cache.delete(id)
      });
      return id; // Mientras carga, mostramos el id
    }

    const categoria = this.cache.get(id);
    if (!categoria) return id;

    return this.capitalizeWords(categoria.nombre);
  }

  private capitalizeWords(text: string): string {
    if (!text) return '';
    return text
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
}
