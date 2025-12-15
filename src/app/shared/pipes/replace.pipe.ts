import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replace',
  standalone: true,
})
export class ReplacePipe implements PipeTransform {
  transform(
    value: string | string[] | null | undefined,
    search: string,
    replacement: string = ''
  ): string {
    if (value == null) return '';

    let text = '';

    // Si es array → lo unimos con coma
    if (Array.isArray(value)) {
      text = value.join(',');
    } else {
      text = value;
    }

    if (!search) return text;

    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');

    return text.replace(regex, replacement);
  }
}
