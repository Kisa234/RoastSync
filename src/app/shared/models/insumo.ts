import { InventarioInsumo } from "./inventario-insumo";

export interface Insumo {
  id_insumo: string;
  nombre: string;
  id_categoria: string;
  unidad_medida: string;
  descripcion?: string;
  activo?: boolean;
  created_at?: string | Date;
}

export interface InsumoConInventarios extends Insumo {
  inventarios: InventarioInsumo[];
  stock_total: number;
  cantidad_almacenes: number;
  stock_inicial_referencial: number;
  fecha_primer_registro?: string | Date | null;
}
