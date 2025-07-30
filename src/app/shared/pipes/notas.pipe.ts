import { Pipe, PipeTransform } from '@angular/core';
import { SensorialData } from '../models/sensorial-data';

@Pipe({
  name: 'notasSensoriales',
  standalone: true
})
export class NotasSensorialesPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return 'Sin Notas';
    let data: SensorialData;
    try {
      data = JSON.parse(value) as SensorialData;
    } catch {
      return 'Sin Notas';
    }

    const lines: string[] = [];
    if (data.notas?.length) {
      lines.push(`Notas a ${data.notas.join(', ')}.`);
    }
    if (data.acidez != null && data.acidez !== '') {
      lines.push(`presenta una acidez ${data.acidez}`);
    }
    if (data.cuerpo != null && data.cuerpo !== '') {
      lines.push(`y un cuerpo ${data.cuerpo}.`);
    }

    return lines.length ? lines.join('\n') : 'Sin Notas';
  }
}
