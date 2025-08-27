export type TMolienda = 'ENTERO' | 'MOLIDO';

export interface ProductoSku {
    id_sku: string;
    id_producto: string;
    id_lote_tostado: string;
    gramaje: number;
    molienda: TMolienda;
    cantidad: number;
    eliminado: boolean;
    fecha_registro: string;
    sku_code?: string | null;
    fecha_editado?: string | null;
}

export interface CreateProductoSku {
    id_producto: string;
    id_lote_tostado: string;
    gramaje: number;
    molienda: TMolienda;
    cantidad: number;
    sku_code?: string | null;
}

export interface UpdateProductoSku {
    gramaje?: number;
    molienda?: TMolienda;
    cantidad?: number;
    sku_code?: string | null;
}
