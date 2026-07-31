export interface Bolsa {
  id_bolsa: string;
  id_lote_tostado: string;
  id_pedido: string;
  gramaje: number;
  molienda: string;
  cantidad: number;
  fecha_embolsado: string | Date;
  id_user?: string;
  comentario?: string;
  eliminado: boolean;
}

export interface InventarioBolsa {
  id_inventario: string;
  id_bolsa: string;
  id_almacen: string;
  cantidad: number;
  fecha_registro?: string | Date;
  fecha_editado?: string | Date;
  almacen?: { nombre: string };
}

export interface BolsaConInventario extends Bolsa {
  inventarios: InventarioBolsa[];
}