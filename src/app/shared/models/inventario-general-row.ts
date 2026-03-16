export interface InventarioGeneralRow {
  tipoEntidad: 'PRODUCTO' | 'INSUMO' | 'MUESTRA' | 'LOTE_VERDE' | 'LOTE_TOSTADO';
  idInventario: string;
  idEntidad: string;
  nombre: string;
  presentacion?: string;
  cantidad: number;
  unidad?: string;
  almacen?: string;
  comentario?: string;
  raw?: any;
}
