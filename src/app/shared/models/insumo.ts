export interface Insumo {
  id_insumo: string;
  nombre: string;
  id_categoria: string;
  unidad_medida: string;
  descripcion?: string;
  activo?: boolean;
  created_at?: string | Date;
}