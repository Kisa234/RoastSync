export interface InsumoInventarioRef {
  id_insumo: string;
  nombre: string;
  descripcion?: string | null;
  unidad_medida?: string | null;
}

export interface AlmacenInventarioRef {
  id_almacen: string;
  nombre: string;
}

export interface InventarioInsumo {
  id_inventario: string;
  id_insumo: string;
  id_almacen: string;
  cantidad: number;
  fecha_registro: string;
  fecha_editado?: string | null;

  insumo?: InsumoInventarioRef;
  almacen?: AlmacenInventarioRef;
}
