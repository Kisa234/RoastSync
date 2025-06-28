export interface Analisis {
  id_analisis: string;
  fecha_registro: Date;
  analisisFisico_id?: string;
  analisisSensorial_id?: string;
  analisisDefectos_id?: string;
  comentario?: string;
}
