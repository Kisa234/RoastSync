export interface Categoria {
  id_categoria: string;
  nombre: string;
  descripcion?: string;
  fecha_registro: Date;
  eliminado: boolean;
}