import { PaqueteConItems } from './paquete';
import { DireccionEnvio, CreateDireccionEnvio } from './direccion-envio';
import { EstadoEnvio } from '../enum/estado-envio.enum';
import { QuienPaga } from '../enum/quien-paga.enum';

export interface Envio {
  id_envio: string;
  numero_correlativo: string; // "ENV-000001"
  id_paquete: string;
  estado: EstadoEnvio;
  eliminado: boolean;

  medio_envio?: string | null;
  numero_tracking?: string | null;
  costo_envio?: number | null;
  quien_paga?: QuienPaga | null;

  peso_total_kg?: number | null;
  alto_cm?: number | null;
  ancho_cm?: number | null;
  largo_cm?: number | null;

  fecha_registro: string;
  fecha_programada?: string | null;
  fecha_despacho_real?: string | null;
  fecha_entrega_estimada?: string | null;
  fecha_entrega_real?: string | null;

  registrado_por_id: string;
  despachado_por_id?: string | null;
  entregado_por_id?: string | null;
  cancelado_por_id?: string | null;
  comentario_cancelacion?: string | null;

  paquete?: PaqueteConItems;
  direccion?: DireccionEnvio | null;
}

export interface EnvioConDetalle extends Envio {
  paquete: PaqueteConItems;
  direccion: DireccionEnvio | null;
}

export interface CreateEnvio {
  id_paquete: string;
  registrado_por_id?: string;
  direccion: CreateDireccionEnvio;
  medio_envio?: string;
  fecha_programada?: string;
  numero_tracking?: string;
  costo_envio?: number;
  quien_paga?: QuienPaga;
  peso_total_kg?: number;
  alto_cm?: number;
  ancho_cm?: number;
  largo_cm?: number;
}

export interface ProgramarEnvio {
  fecha_programada: string;
  medio_envio?: string;
}

export interface DespacharEnvio {
  despachado_por_id?: string;
  numero_tracking?: string;
}

export interface ConfirmarEntregaEnvio {
  entregado_por_id?: string;
}

export interface CancelarEnvio {
  cancelado_por_id?: string;
  comentario_cancelacion?: string;
}

export interface RegistrarDevolucionEnvio {
  registrado_por_id?: string;
  comentario?: string;
}