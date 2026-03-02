export interface IngresoProducto {
    id_ingreso: string;
    id_producto: string;
    id_almacen: string;
    cantidad: number;
    precio_compra: number;
    fecha_ingreso: string;
    id_user: string;
}