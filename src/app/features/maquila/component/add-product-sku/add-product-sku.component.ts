import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Check } from 'lucide-angular';
import { ProductoService } from '../../service/producto.service';
import { ProductoSkuService } from '../../service/producto-sku.service';
import { Producto } from '../../../../shared/models/producto';
import { ProductoSku, TMolienda } from '../../../../shared/models/productoSku';
import { LoteTostadoService } from '../../../inventory/service/lote-tostado.service';
import { SelectSearchComponent } from '../../../../shared/components/select-search/select-search.component';

@Component({
  selector: 'add-product-sku',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, SelectSearchComponent],
  templateUrl: './add-product-sku.component.html'
})
export class AddProductSkuComponent {

  // icons
  readonly X = X;
  readonly Check = Check;

  @Output() created = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  // ui
  saving = false;
  error: string | null = null;

  // selects data
  productos: Producto[] = [];
  selectedProducto: Producto | null = null;
  lotesTostadosAll: any[] = [];
  lotesTostados: any[] = [];
  selectedLote: any | null = null;

  model: ProductoSku = {
    id_sku: '',
    id_producto: '',
    id_lote_tostado: '',
    gramaje: 0,
    molienda: 'ENTERO',
    cantidad: 0,
    eliminado: false,
    fecha_registro: ''
  }

  // previews
  previewSku = '—';
  pesoTotalGr = 0;

  constructor(
    private productoService: ProductoService,
    private skuService: ProductoSkuService,
    private loteTostadoService: LoteTostadoService,
  ) {
    this.loadOptions();
  }

  async loadOptions() {
    this.productoService.list().subscribe(productos =>{
      this.productos = productos;
    })
    this.loteTostadoService.getAll().subscribe(lotes =>{
      this.lotesTostadosAll = lotes;
    })
  }

  onProductoChange(id: string) {
    this.productoService.getById(id).subscribe(producto => {
      this.selectedProducto = producto;

      // reset dependientes
      this.model.id_lote_tostado = '';
      this.selectedLote = null;

      // filtra por id_lote del producto
      if (producto?.id_lote) {
        this.lotesTostados = this.lotesTostadosAll.filter(
          lt => lt.id_lote === producto.id_lote
        );
      } else {
        // si el producto no tiene id_lote vinculado, deja vacío (o muestra todos, como prefieras)
        this.lotesTostados = [];
      }
    });
  }

  onLoteChange(id: string) {
    this.selectedLote = this.lotesTostados.find(l => l.id_lote_tostado === id) || null;
    this.recalc();
  }

  recalc() {
    const gramaje = Number(this.model.gramaje ?? 0);
    const cantidad = Number(this.model.cantidad ?? 0);
    this.pesoTotalGr = (Number.isFinite(gramaje) ? gramaje : 0) * (Number.isFinite(cantidad) ? cantidad : 0);

    const lote = this.model.id_lote_tostado || '';
    const suf = this.model.molienda === 'ENTERO' ? 'ENT' : (this.model.molienda === 'MOLIDO' ? 'MOL' : '—');
    this.previewSku = (lote && gramaje > 0 && suf !== '—') ? `${lote}-${gramaje}-${suf}` : '—';
  }

  canSave() {
    return !!this.model.id_producto
      && !!this.model.id_lote_tostado
      && Number.isFinite(this.model.gramaje) && (this.model.gramaje! > 0)
      && (this.model.molienda === 'ENTERO' || this.model.molienda === 'MOLIDO')
      && Number.isInteger(this.model.cantidad as number) && (this.model.cantidad! > 0)
      && !this.saving;
  }

  onCancel() {
    if (!this.saving) this.close.emit();
  }

  async save() {
    if (!this.canSave()) return;
    this.error = null;
    this.saving = true;

    const payload = {
      id_producto: this.model.id_producto!,
      id_lote_tostado: this.model.id_lote_tostado!,
      gramaje: Number(this.model.gramaje),
      molienda: this.model.molienda!,
      cantidad: Number(this.model.cantidad),
      sku_code: `${this.model.id_lote_tostado}-${this.model.gramaje}-${this.model.molienda === 'ENTERO' ? 'ENT' : 'MOL'}`
    };

    try {
      const created = await this.skuService.create(payload).toPromise();
      this.created.emit(created);
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || 'No se pudo crear/actualizar el SKU';
    } finally {
      this.saving = false;
    }
  }
}
