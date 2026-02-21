export interface Historial {
  id_historial: string,
  entidad: string,
  id_entidad: string,
  id_user: string,
  accion: string,
  comentario: string | null,
  objeto_antes: any | null,
  fecha_registro: Date
}