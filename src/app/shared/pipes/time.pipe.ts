// src/app/shared/pipes/min-sec.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'minSec',
  standalone: true
})
export class MinSecPipe implements PipeTransform {
  transform(
    totalSeconds: number | null | undefined,
    format: 'label' | 'clock' = 'label'
  ): string {
    if (totalSeconds == null || isNaN(totalSeconds as any)) return '';

    const sec = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    if (format === 'clock') {
      // H:MM:SS si hay horas, sino MM:SS
      return h > 0
        ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        : `${m}:${s.toString().padStart(2, '0')}`;
    }

    // Formato con etiquetas: "8 min 20 s" (y añade horas si aplica)
    const parts: string[] = [];
    if (h) parts.push(`${h} h`);
    if (m || h) parts.push(`${m} min`);
    parts.push(`${s} s`);
    return parts.join(' ');
  }
}
