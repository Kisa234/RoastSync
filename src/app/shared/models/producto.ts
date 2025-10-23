export interface Producto {
  id_producto: string;
  nombre: string;
  descripcion?: string;
  id_categoria: string;
  es_combo: boolean;
  activo: boolean;
  fecha_registro: Date;
  fecha_editado?: Date;
}