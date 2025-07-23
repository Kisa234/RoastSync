import { CommonModule } from '@angular/common';
import { Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-time-input',
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimeInputComponent),
      multi: true
    }
  ],
  templateUrl: './time-input.component.html',
  styles: ``
})
export class TimeInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() prom = 0;

  minutes = 0;
  seconds = 0;

  private onChange = (v: number) => { };
  private onTouched = () => { };

  writeValue(totalSec: number): void {
    const t = totalSec || 0;
    this.minutes = Math.floor(t / 60);
    this.seconds = t % 60;
  }

  get promDate(): Date {
    return new Date(this.prom * 1000);
  }

  registerOnChange(fn: any) { this.onChange = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }

  // cada vez que cambia min o seg, emitimos total en segundos
  update() {
    const total = (this.minutes || 0) * 60 + (this.seconds || 0);
    this.onChange(total);
  }
}
