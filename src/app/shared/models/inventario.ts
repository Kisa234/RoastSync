import { Molienda } from "./molienda";

export interface Inventario {
  id_inventario: string;
  id_producto: string;
  id_lote_tostado?: string;
  cantidad: number;
  gramaje?: number;
  molienda: Molienda;
  unidad_medida?: string;
  fecha_registro: string;
  fecha_editado?: string;
}