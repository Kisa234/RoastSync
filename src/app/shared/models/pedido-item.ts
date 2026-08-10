import { EntidadInventario } from "../enum/entidad-inventario.enum";

export interface PedidoItem {
  id_pedido_item: string;
  id_pedido: string;
  entidad: EntidadInventario;
  id_entidad: string;
  cantidad: number;
}

export interface PedidoItemInput {
  entidad: EntidadInventario;
  id_entidad: string;
  cantidad: number;
}