export interface Cambio {
  id_cambio: string;

  entidad: string;        // ej: 'lote', 'pedido', 'ingreso-cafe'
  id_entidad: string;

  objeto_antes: any;      // snapshot del objeto antes del cambio

  id_user: string;

  created_at: Date | string;
  comentario?: string;
}
