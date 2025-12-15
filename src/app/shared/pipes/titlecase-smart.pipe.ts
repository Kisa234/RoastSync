import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titlecaseSmart'
})
export class TitlecaseSmartPipe implements PipeTransform {

  transform(value: string | null | undefined): string {
    if (!value) return '';

    // Convertir a string por si viene como ENUM o diferente tipo
    let str = String(value).toLowerCase();

    // Reemplazar guiones bajos por espacios
    str = str.replace(/_/g, ' ');

    // Aplicar titlecase palabra por palabra
    return str.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    );
  }

}
