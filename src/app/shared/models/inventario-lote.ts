export interface LoteInventarioRef {
  id_lote: string;
  nombre?: string | null;
  codigo?: string | null;
  tipo_lote?: string | null;
}

export interface AlmacenInventarioRef {
  id_almacen: string;
  nombre: string;
}

export interface InventarioLote {
  id_inventario: string;
  id_lote: string;
  id_almacen: string;
  cantidad_kg: number;
  cantidad_tostado_kg: number;
  fecha_registro: string;
  fecha_editado?: string | null;
  lote?: LoteInventarioRef;
  almacen?: AlmacenInventarioRef;
}


export interface CreateInventarioLote {
  id_lote: string;
  id_almacen: string;
  cantidad_kg: number;

}

export interface UpdateInventarioLote {
  cantidad_kg: number;
  cantidad_tostado_kg?: number;

}