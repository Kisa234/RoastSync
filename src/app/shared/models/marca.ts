export interface Marca {
  id_marca: string;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
  fecha_registro: Date | string;
  fecha_editado?: Date | string | null;
}