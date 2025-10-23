import { Molienda } from "./molienda";

export interface Pedido {
  id_pedido: string;
  fecha_registro: Date;
  tipo_pedido: string;
  cantidad: number;
  estado_pedido: string;
  id_user: string;
  id_lote?: string;
  eliminado: boolean;

  id_nuevoLote?: string;
  id_nuevoLote_tostado?: string;
  comentario?: string;
  pesos?: number[];

  fecha_tueste?: Date|string;
  tostadora?: string;

  id_lote_tostado?: string;
  gramaje?: number;
  molienda?: Molienda;
  id_producto?: string;

  creado_por_id?: string;
  completado_por_id?: string;
  fecha_completado?: Date;

}
