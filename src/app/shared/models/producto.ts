export interface Producto {
  id_producto: string;
  nombre: string;
  descripcion?: string | null;

  // Identidad comercial (normalizada)
  id_marca?: string | null;
  modelo?: string | null;
  color?: string | null;

  // Atributos físicos fijos
  peso_kg?: number | null;
  largo_cm?: number | null;
  ancho_cm?: number | null;
  alto_cm?: number | null;
  volumen_cm3?: number | null;
  material?: string | null;
  fragil?: boolean | null;

  id_categoria: string;
  es_combo: boolean;
  activo: boolean;

  fecha_registro: Date;
  fecha_editado?: Date | null;
}