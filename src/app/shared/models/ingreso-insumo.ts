export interface IngresoInsumo {
  id_ingreso: string;
  id_insumo: string;
  id_almacen: string;
  cantidad: number;
  precio_compra: number;
  fecha_ingreso: string;
  id_user: string;
}