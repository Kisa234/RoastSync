export interface Lote {
  id_lote: string;
  productor?: string;
  finca?: string;
  distrito?: string;
  departamento?: string;
  peso: number;
  variedades: string[];
  proceso: string;
  tipo_lote: string;
  fecha_registro: Date;
  eliminado: boolean;
  clasificacion?:string;
  costo?: number;
  altura?: number;
  id_user?: string;
  id_analisis?: string;
  peso_tostado?: number;
}
