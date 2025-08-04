import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  forwardRef,
  ElementRef,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';

@Component({
  selector: 'select-search',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './select-search.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectSearchComponent),
    multi: true
  }]
})
export class SelectSearchComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() items: any[] = [];
  @Input() displayField = '';
  @Input() valueField = '';
  @Input() placeholder = 'Select...';
  @Input() multiple = false;

  readonly ChevronDown = ChevronDown;

  search = '';
  filtered: any[] = [];
  open = false;
  selected: any = null;

  private onChange = (v: any) => {};
  private onTouch = () => {};

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.filtered = [...this.items];
    this.selected = this.multiple ? [] : null;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items']) {
      this.filtered = [...(this.items ?? [])];

      if (this.multiple) {
        // Si selected no es array, lo tratamos como vacío
        const values = Array.isArray(this.selected)
          ? this.selected.map(s => s[this.valueField] ?? s)
          : [];
        this.selected = this.items.filter(i => values.includes(i[this.valueField]));
      } else {
        // Sólo reasignamos si ya había un selected válido
        if (this.selected && typeof this.selected === 'object') {
          this.selected = this.items.find(i => i[this.valueField] === this.selected[this.valueField]) || null;
        }
      }
    }
  }

  writeValue(obj: any): void {
    if (this.multiple && Array.isArray(obj)) {
      this.selected = this.items.filter(i => obj.includes(i[this.valueField]));
    } else if (!this.multiple) {
      this.selected = this.items.find(i => i[this.valueField] === obj) || null;
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouch = fn; }

  toggle() {
    this.open = !this.open;
  }

  filter() {
    const term = this.search.toLowerCase();
    this.filtered = (this.items ?? []).filter(i =>
      ('' + i[this.displayField]).toLowerCase().includes(term)
    );
  }

  select(item: any) {
    if (this.multiple) {
      const arr = Array.isArray(this.selected) ? [...this.selected] : [];
      const exists = arr.some(i => i[this.valueField] === item[this.valueField]);

      this.selected = exists
        ? arr.filter(i => i[this.valueField] !== item[this.valueField])
        : [...arr, item];

      this.onChange((this.selected as any[]).map(i => i[this.valueField]));
    } else {
      this.selected = item;
      this.open = false;
      this.onChange(item[this.valueField]);
    }

    this.search = '';
    this.filtered = [...(this.items ?? [])];
    this.onTouch();
  }

  isSelected(item: any): boolean {
    return this.multiple && Array.isArray(this.selected)
      ? (this.selected as any[]).some(i => i[this.valueField] === item[this.valueField])
      : false;
  }

  get displayValue(): string {
    if (this.multiple && Array.isArray(this.selected)) {
      return this.selected.length
        ? (this.selected as any[]).map(i => i[this.displayField]).join(', ')
        : this.placeholder;
    }
    return this.selected ? this.selected[this.displayField] : this.placeholder;
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement) {
    if (this.open && !this.elementRef.nativeElement.contains(target)) {
      this.open = false;
    }
  }

  addNew() {
    const value = this.search.trim();
    if (!value) return;

    const newItem: any = {
      [this.displayField]: value,
      [this.valueField]: value
    };

    this.items = [...(this.items ?? []), newItem];
    this.filtered = [...this.items];
    this.select(newItem);
    this.search = '';
  }
}
