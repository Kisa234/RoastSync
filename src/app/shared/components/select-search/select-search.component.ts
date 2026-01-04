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
  @HostListener('document:click', ['$event.target'])
  

  @Input() items: any[] = [];
  @Input() displayField = '';
  @Input() secondDisplayField?: string;
  @Input() valueField = '';
  @Input() placeholder = 'Select...';
  @Input() multiple = false;
  @Input() multipleAsString = false;
  @Input() displayFn?: (item: any) => string;

  search = '';
  filtered: any[] = [];
  open = false;
  selected: any = null;


  private pendingValue: any = null;
  private onChange = (v: any) => { };
  private onTouch = () => { };

  constructor(private elementRef: ElementRef) { }

  readonly ChevronDown = ChevronDown;

  ngOnInit() {
    this.filtered = [...this.items];
    this.selected = this.multiple ? [] : null;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items']) {
      this.filtered = [...(this.items ?? [])];

      if (this.pendingValue !== null && this.items.length > 0) {
        this.writeValue(this.pendingValue);
        this.pendingValue = null;
      } else if (this.multiple) {
        const values = Array.isArray(this.selected)
          ? this.selected.map(s => this.getValueByPath(s, this.valueField) ?? s)
          : [];
        this.selected = this.items.filter(i =>
          values.includes(this.getValueByPath(i, this.valueField))
        );
      } else {
        if (this.selected && typeof this.selected === 'object') {
          const currentVal = this.getValueByPath(this.selected, this.valueField);
          this.selected =
            this.items.find(i => this.getValueByPath(i, this.valueField) === currentVal) || null;
        }
      }
    }
  }


  writeValue(obj: any): void {
    if (this.multiple) {
      if (this.multipleAsString && typeof obj === 'string') {
        const values = obj.split(',').map(v => v.trim()).filter(v => v !== '');
        if (!this.items || this.items.length === 0) {
          // <-- guardar pendiente hasta que lleguen los items
          this.pendingValue = obj;
          this.selected = [];
        } else {
          this.selected = this.items.filter(i =>
            values.includes(this.getValueByPath(i, this.valueField))
          );
        }
      } else if (Array.isArray(obj)) {
        if (!this.items || this.items.length === 0) {
          this.pendingValue = obj;
          this.selected = [];
        } else {
          this.selected = this.items.filter(i =>
            obj.includes(this.getValueByPath(i, this.valueField))
          );
        }
      } else {
        this.selected = [];
      }
    } else {
      // flujo normal single
      const found = this.items.find(i => this.getValueByPath(i, this.valueField) === obj);
      if (found) {
        this.selected = found;
        this.pendingValue = null;
      } else if (this.items.length === 0 && obj) {
        this.pendingValue = obj;
        this.selected = null;
      } else {
        this.selected = null;
        this.pendingValue = null;
      }
    }
  }




  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouch = fn; }

  toggle() { this.open = !this.open; }

  /** Soporta rutas con punto: 'cliente.nombre' */
  private getValueByPath(obj: any, path?: string): any {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, k) => (acc?.[k]), obj);
  }

  isValid(value: any) {
    return value !== null && value !== undefined && value !== '';
  }

  /** Etiqueta a mostrar: displayFn > secondDisplayField > displayField */
  getLabel(item: any): string {
    if (!item) return '';

    if (this.displayFn) {
      try { return String(this.displayFn(item) ?? ''); } catch { return ''; }
    }

    const valSecond = this.secondDisplayField ? this.getValueByPath(item, this.secondDisplayField) : null;
    const valFirst = this.displayField ? this.getValueByPath(item, this.displayField) : null;

    return String(this.isValid(valSecond) ? valSecond : this.isValid(valFirst) ? valFirst : '');
  }

  filter() {
    const term = this.search.toLowerCase();
    this.filtered = (this.items ?? []).filter(i => {
      const parts = [
        this.getValueByPath(i, this.displayField),
        this.getValueByPath(i, this.secondDisplayField)
      ]
        .filter(v => v !== undefined && v !== null)
        .map(v => String(v).toLowerCase());
      return parts.some(p => p.includes(term));
    });
  }

  select(item: any) {
    if (this.multiple) {
      const arr = Array.isArray(this.selected) ? [...this.selected] : [];
      const itemVal = this.getValueByPath(item, this.valueField);
      const exists = arr.some(i => this.getValueByPath(i, this.valueField) === itemVal);

      this.selected = exists
        ? arr.filter(i => this.getValueByPath(i, this.valueField) !== itemVal)
        : [...arr, item];

      if (this.multipleAsString) {
        this.onChange((this.selected as any[])
          .map(i => this.getValueByPath(i, this.valueField))
          .join(', '));
      } else {
        this.onChange((this.selected as any[]).map(i => this.getValueByPath(i, this.valueField)));
      }
    } else {
      this.selected = item;
      this.open = false;
      this.onChange(this.getValueByPath(item, this.valueField));
    }

    this.search = '';
    this.filtered = [...(this.items ?? [])];
    this.onTouch();
  }


  isSelected(item: any): boolean {
    return this.multiple && Array.isArray(this.selected)
      ? (this.selected as any[]).some(i =>
        this.getValueByPath(i, this.valueField) === this.getValueByPath(item, this.valueField))
      : false;
  }

  get displayValue(): string {
    if (this.multiple && Array.isArray(this.selected)) {
      const unique = this.selected.filter(
        (item, index, self) =>
          index === self.findIndex(i =>
            this.getValueByPath(i, this.valueField) === this.getValueByPath(item, this.valueField)
          )
      );
      return unique.length
        ? unique.map(i => this.getLabel(i)).join(', ')
        : this.placeholder;
    }
    return this.selected ? this.getLabel(this.selected) : this.placeholder;
  }

  onDocumentClick(target: HTMLElement) {
    this.onClickOutside(target);
  }

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
