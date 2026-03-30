export interface Lote {
  id_lote: string;
  productor?: string;
  finca?: string;
  distrito?: string;
  departamento?: string;
  peso: number;
  variedades: string[];
  proceso: string;
  tipo_lote: string;
  fecha_registro: Date;
  eliminado: boolean;
  clasificacion?:string;
  costo?: number;
  altura?: number;
  id_user?: string;
  id_analisis?: string;
  peso_tostado?: number;
  almacen? :string;
}


export interface InventarioLoteMini {
  id_inventario: string;
  id_lote: string;
  id_almacen: string;
  cantidad_kg: number;
  cantidad_tostado_kg: number;
  fecha_registro: Date;
  fecha_editado?: Date | null;

  almacen?: {
    id_almacen: string;
    nombre: string;
  } | null;
}
export interface LoteVerdeConInventario {
  id_lote: string;
  proveedor: string;
  productor: string;
  finca: string;
  distrito: string;
  departamento: string;
  peso: number;
  variedades: string[];
  proceso: string;
  tipo_lote: string;
  fecha_registro: Date;
  eliminado: boolean;

  clasificacion?: string;
  costo?: number;
  altura?: number;
  id_user?: string;
  id_analisis?: string;
  peso_tostado?: number;

  inventarioLotes: InventarioLoteMini[];
}