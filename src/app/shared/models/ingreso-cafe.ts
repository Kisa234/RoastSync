export interface IngresoCafe {
  id_ingreso: string;
  id_lote: string;

  cantidad_kg: number;
  costo_unitario: number;

  fecha_ingreso: Date | string;

  proveedor?: string;
  id_user?: string;
}
