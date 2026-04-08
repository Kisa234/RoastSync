export interface MuestraInventarioRef {
  id_muestra: string;
  nombre?: string | null;
  codigo?: string | null;
  tipo?: string | null;
}

export interface AlmacenInventarioRef {
  id_almacen: string;
  nombre: string;
}

export interface InventarioMuestra {
  id_inventario: string;
  id_muestra: string;
  id_almacen: string;
  peso: number;
  fecha_registro: string;
  fecha_editado?: string | null;

  muestra?: MuestraInventarioRef;
  almacen?: AlmacenInventarioRef;
}
