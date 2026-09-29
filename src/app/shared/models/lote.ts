export interface Lote {
  id_lote: string;
  productor?: string;
  finca?: string;
  distrito?: string;
  departamento?: string;
  provincia?: string | null;     // <-- Lo nuevo que hizo tu amigo
  peso: number;
  variedades: string[];
  proceso: string;
  tipo_lote: string;
  fecha_registro: Date;
  eliminado: boolean;
  clasificacion?:string;
  costo?: number;
  altura?: number | null;        // <-- Tu amigo le agregó "| null" a esto
  anio_cosecha?: number | null;  // <-- Lo nuevo que hizo tu amigo
  id_user?: string;
  id_analisis?: string;
  peso_tostado?: number;
  almacen? :string;
  precio_venta?: number;
  owned_by_store?: boolean;
  
  // --- NUESTROS CAMBIOS ---
  precio_1?: number;
  escala_2?: number;
  escala_3?: number;
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

export interface LoteVerdeConInventario extends Lote {
  proveedor: string;
  inventarioLotes: InventarioLoteMini[];
}