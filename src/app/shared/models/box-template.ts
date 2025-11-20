export interface BoxTemplateModel {
  id_box_template: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  eliminado: boolean;
  cafe_fijo_1: string;
  cafe_fijo_2: string;
  fecha_creado: Date;
  opciones?: any[];
}
