export interface Envio {
  id_envio: string;
  id_lote_tostado: string;
  id_cliente: string;
  id_almacen?: string;
  cantidad: number;
  fecha: string;
  clasificacion?: string;
  comentario?: string;
  origen?: string;
}

export interface CreateEnvio {
  id_lote_tostado: string;
  id_cliente: string;
  id_almacen: string;
  cantidad: number;
  fecha?: string;
  clasificacion?: string;
  comentario?: string;
  origen?: string;
}