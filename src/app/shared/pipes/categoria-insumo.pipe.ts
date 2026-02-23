import { Pipe, PipeTransform } from '@angular/core';
import { CategoriaInsumo } from '../models/categoria-insumo';

@Pipe({
  name: 'categoriaInsumo',
  standalone: true
})
export class CategoriaInsumoPipe implements PipeTransform {

  transform(idCategoria: string, categorias: CategoriaInsumo[]): string {
    if (!idCategoria || !categorias || categorias.length === 0) {
      return '';
    }

    const categoria = categorias.find(c => c.id_categoria === idCategoria);
    return categoria ? categoria.nombre : 'Sin categoría';
  }

}