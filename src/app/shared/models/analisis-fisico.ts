export interface AnalisisFisico {
  id_analisis_fisico: string;
  fecha_registro: Date;
  peso_muestra: number;
  peso_pergamino: number;
  wa: number;
  temperatura_wa: number;
  humedad: number;
  temperatura_humedad: number;
  densidad: number;
  color_grano_verde: string;
  olor: string;
  superior_malla_18: number;
  superior_malla_16: number;
  superior_malla_14: number;
  menor_malla_16: number;
  peso_defectos: number;
  quaquers: number;
  peso_muestra_tostada: number;
  desarrollo: number;
  pocentaje_caramelizcacion: number;
  c_desarrollo: number;
  grado: string;
  comentario: string;
  defectos_primarios: string[];
  defectos_secundarios: string[];
  eliminado?: boolean;
}
