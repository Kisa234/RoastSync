import { Almacen } from './almacen';
import { InventarioMuestra } from './inventario-muestra';
export interface Muestra {
  id_muestra: string;
  owned_by_store: boolean;
  nombre_muestra?: string;
  productor: string;
  finca: string;
  distrito: string;
  departamento: string;
  provincia?: string | null;
  peso: number;
  variedades: string[];
  proceso: string;
  altura?: number | null;
  anio_cosecha?: number | null;
  fecha_registro: Date;
  completado: boolean;
  eliminado: boolean;
  id_user?: string;
  id_analisis?: string;

  almacen?: string;
}

export interface MuestraConInventario {
  id_muestra: string;
  owned_by_store: boolean;
  nombre_muestra: string;
  proveedor: string;
  productor: string;
  finca: string;
  distrito: string;
  departamento: string;
  provincia?: string | null;
  peso: number;
  variedades: string;
  proceso: string;
  altura?: number | null;
  anio_cosecha?: number | null;
  fecha_registro: string;
  completado: boolean;
  eliminado: boolean;
  id_user: string;
  id_analisis: string;

  inventarioMuestras: InventarioMuestra[];
}