import { User } from './user';
import { PaqueteItem } from './paquete-item';
import { EstadoPaquete } from '../enum/estado-paquete.enum';
import { Envio } from './envio';

export interface Paquete {
  id_paquete: string;
  numero_correlativo?: string | null;
  id_cliente: string;
  id_pedido_origen?: string | null;
  estado: EstadoPaquete;
  comentario?: string | null;
  eliminado: boolean;
  fecha_registro: string;
  fecha_editado?: string | null;
  creado_por_id: string;
  preparado_por_id?: string | null;
  fecha_preparado?: string | null;

  cliente?: User;
  creadoPor?: User;
  preparadoPor?: User;
}

export interface PaqueteConItems extends Paquete {
  items: PaqueteItem[];
  envios: Envio[]; 
}

export interface CreatePaquete {
  id_cliente: string;
  id_pedido_origen?: string;
  comentario?: string;
}

export interface MarcarListoPaquete {
  preparado_por_id?: string;
}

export interface CancelarPaquete {
  comentario?: string;
}