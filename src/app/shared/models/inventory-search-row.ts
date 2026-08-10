import { EntidadInventario } from '../enum/entidad-inventario.enum';

export type InventoryUiTipo = 'INSUMO' | 'LOTE_VERDE' | 'LOTE_TOSTADO' | 'MUESTRA' | 'PRODUCTO' | 'BOLSA';

export interface InventoryByAlmacen {
  id_almacen: string;
  nombre: string;
  cantidad: number;
}

export interface InventorySearchRow {
  id: string;
  displayName: string;
  reference: string;
  tipo: InventoryUiTipo;
  userId?: string;
  stockTotal: number;
  almacenes: InventoryByAlmacen[];
}

export function mapTipoToEntidadInventario(tipo: InventoryUiTipo): EntidadInventario {
  switch (tipo) {
    case 'LOTE_VERDE': return EntidadInventario.LOTE;
    case 'LOTE_TOSTADO': return EntidadInventario.LOTE_TOSTADO;
    case 'PRODUCTO': return EntidadInventario.PRODUCTO;
    case 'MUESTRA': return EntidadInventario.MUESTRA;
    case 'INSUMO': return EntidadInventario.INSUMO;
    case 'BOLSA': return EntidadInventario.BOLSA;
  }
}

export function labelTipo(tipo: InventoryUiTipo): string {
  switch (tipo) {
    case 'INSUMO': return 'Insumo';
    case 'LOTE_VERDE': return 'Lote Verde';
    case 'LOTE_TOSTADO': return 'Lote Tostado';
    case 'MUESTRA': return 'Muestra';
    case 'PRODUCTO': return 'Producto';
    case 'BOLSA': return 'Bolsa';
  }
}