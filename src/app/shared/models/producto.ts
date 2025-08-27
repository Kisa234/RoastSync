export interface Producto {
    id_producto: string;
    nombre: string;
    activo: boolean;
    fecha_registro: string;
    descripcion?: string | null;
    id_lote?: string | null;
    fecha_editado?: string | null;
}

export interface CreateProducto {
    nombre: string;
    descripcion?: string | null;
    id_lote?: string | null;
    activo?: boolean;
}

export interface UpdateProducto {
    nombre?: string;
    descripcion?: string | null;
    id_lote?: string | null;
    activo?: boolean;
}
