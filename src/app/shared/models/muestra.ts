export interface Muestra {
  id_muestra: string;
  productor: string;
  finca: string;
  region: string;
  departamento: string;
  peso: number;
  variedades: string[];
  proceso: string;
  fecha_registro: Date;
  eliminado: boolean;
  id_user?: string;
  id_analisis?: string;
}
