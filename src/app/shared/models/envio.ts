export interface Envio {
  id_envio: string;
  id_lote_tostado: string;
  id_cliente: string;
  cantidad: number;
  fecha: string;          
  clasificacion?: string;       
  observaciones?: string;
}

export interface CreateEnvio {
  id_lote_tostado: string;
  id_cliente: string;
  cantidad: number;
  fecha?: string;         
  clasificacion?: string;
  observaciones?: string;
}