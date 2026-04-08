export interface LoteTostadoInventarioRef {
  id_lote_tostado: string;
  nombre?: string | null;
  codigo?: string | null;
}

export interface AlmacenInventarioRef {
  id_almacen: string;
  nombre: string;
}

export interface InventarioLoteTostado {
  id_inventario: string;
  id_lote_tostado: string;
  id_almacen: string;
  cantidad_kg: number;
  fecha_registro: string;
  fecha_editado?: string | null;

  loteTostado?: LoteTostadoInventarioRef;
  almacen?: AlmacenInventarioRef;
}
