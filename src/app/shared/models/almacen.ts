import { Molienda } from "./molienda";

export interface Almacen {
  id_almacen: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  created_at?: string;
}

export interface CreateAlmacenDto {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export type UpdateAlmacenDto = Partial<CreateAlmacenDto>;


export interface AjustarStockPayload {
  entidad: 'LOTE' | 'LOTE_TOSTADO' | 'PRODUCTO' | 'MUESTRA' | 'INSUMO';
  id_entidad: string;
  id_almacen: string;
  nueva_cantidad: number;
  motivo?: string;
  gramaje?: number | null;
  molienda?: Molienda | null;
}

export interface TrasladarStockPayload {
  entidad: 'LOTE' | 'LOTE_TOSTADO' | 'PRODUCTO' | 'MUESTRA' | 'INSUMO';
  id_entidad: string;
  id_almacen_origen: string;
  id_almacen_destino: string;
  cantidad: number;
  motivo?: string;
  gramaje?: number | null;
  molienda?: Molienda | null;
}
