export interface MovimientoAlmacen {
  id_movimiento: string;
  tipo: TipoMovimiento;
  entidad: EntidadInventario;
  id_entidad_primario: string;
  id_entidad_secundario: string;
  cantidad: number;
  id_user: string;
  fecha: string; // ISO
  id_almacen_origen?: string;
  id_almacen_destino?: string;
  comentario?: string;
  id_pedido?:string;
}

export interface CreateMovimientoDto {
  tipo: TipoMovimiento;
  entidad: EntidadInventario;
  id_entidad_primario: string;
  id_entidad_secundario: string;
  cantidad: number;
  id_user: string;
  fecha: string;
  id_almacen_origen?: string;
  id_almacen_destino?: string;
  comentario?: string;
  id_pedido?: string;
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