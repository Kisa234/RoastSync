export interface AnalisisSensorial {
  id_analisis_sensorial: string;
  fragancia_aroma: number;
  sabor: number;
  sabor_residual: number;
  acidez: number;
  cuerpo: number;
  uniformidad: number;
  balance: number;
  taza_limpia: number;
  dulzor: number;
  puntaje_catador: number;
  taza_defecto_ligero: number;
  tazas_defecto_rechazo: number;
  puntaje_taza: number;
  comentario: string;
  fecha_registro: Date;
  eliminado?: boolean;
}
