export interface InventarioLote {
  id_inventario: string;
  id_lote: string;
  id_almacen: string;
  cantidad_kg: number;
  fecha_registro: Date;
  fecha_editado?: Date;
}

export interface CreateInventarioLote {
  id_lote: string;
  id_almacen: string;
  cantidad_kg: number;
}

export interface UpdateInventarioLote {
  cantidad_kg: number;
}