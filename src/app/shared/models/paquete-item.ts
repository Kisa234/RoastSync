import { EntidadInventario } from '../enum/entidad-inventario.enum';
import { Almacen } from './almacen';

export interface PaqueteItem {
  id_item: string;
  id_paquete: string;
  entidad: EntidadInventario;
  id_entidad: string;
  id_almacen: string;
  cantidad: number;
  unidad_medida: string;
  gramaje?: number | null;
  molienda?: string | null;
  comentario?: string | null;

  almacen?: Almacen;
}

export interface CreatePaqueteItem {
  entidad: EntidadInventario;
  id_entidad: string;
  id_almacen: string;
  cantidad: number;
  unidad_medida?: string;
  gramaje?: number;
  molienda?: string;
  comentario?: string;
}