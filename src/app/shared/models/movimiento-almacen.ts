export interface MovimientoAlmacen {
  id_movimiento: string;
  tipo: TipoMovimiento;
  entidad: EntidadInventario;
  id_entidad: string;
  cantidad: number;
  id_user: string;
  fecha: string; // ISO
  id_almacen_origen?: string;
  id_almacen_destino?: string;
  comentario?: string;
}

export interface CreateMovimientoDto {
  tipo: TipoMovimiento;
  entidad: EntidadInventario;
  id_entidad: string;
  cantidad: number;
  id_user: string;
  fecha: string;
  id_almacen_origen?: string;
  id_almacen_destino?: string;
  comentario?: string;
}

export enum EntidadInventario {
  LOTE = 'LOTE',
  LOTE_TOSTADO = 'LOTE_TOSTADO',
  PRODUCTO = 'PRODUCTO',
  MUESTRA = 'MUESTRA',
  INSUMO = 'INSUMO',
}

export enum TipoMovimiento {
  INGRESO = 'INGRESO',
  SALIDA = 'SALIDA',
  TRASLADO = 'TRASLADO',
  AJUSTE = 'AJUSTE',
}