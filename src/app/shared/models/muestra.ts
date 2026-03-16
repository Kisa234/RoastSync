import { Almacen } from './almacen';
import { InventarioMuestra } from './inventario-muestra';
export interface Muestra {
  id_muestra: string;
  nombre_muestra?: string;
  productor: string;
  finca: string;
  distrito: string;
  departamento: string;
  peso: number;
  variedades: string[];
  proceso: string;
  fecha_registro: Date;
  completado: boolean;
  eliminado: boolean;
  id_user?: string;
  id_analisis?: string;

  almacen?: string;
}

export interface MuestraConInventario {
  id_muestra: string;
  nombre_muestra: string;
  proveedor: string;
  productor: string;
  finca: string;
  distrito: string;
  departamento: string;
  peso: number;
  variedades: string;
  proceso: string;
  fecha_registro: string;
  completado: boolean;
  eliminado: boolean;
  id_user: string;
  id_analisis: string;

  inventarioMuestras: InventarioMuestra[];
}