import { Molienda } from "./molienda";

export interface ProductoInventarioRef {
  id_producto: string;
  nombre: string;
  presentacion?: string | null;
  unidad_medida?: string | null;
}

export interface AlmacenInventarioRef {
  id_almacen: string;
  nombre: string;
}

export interface InventarioProducto {
  id_inventario: string;
  id_producto: string;
  id_lote_tostado?: string;
  cantidad: number;
  gramaje?: number;
  molienda: Molienda;
  unidad_medida?: string;
  fecha_registro: string;
  fecha_editado?: string;
  producto?: ProductoInventarioRef;
  almacen?: AlmacenInventarioRef;

}
