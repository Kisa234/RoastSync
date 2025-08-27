export interface FichaEnvio {
  id_ficha: string;
  id_envio: string;
  nombre: string;
  celular: string;
  direccion: string;
  distrito: string;
  dni?: string | null;
  referencia?: string | null;
  fecha_registro: string;
  fecha_editado?: string | null;
}

export interface CreateFichaEnvio {
  nombre: string;
  celular: string;
  direccion: string;
  distrito: string;
  dni?: string;
  referencia?: string;
}

export interface UpdateFichaEnvio {
  nombre?: string;
  celular?: string;
  direccion?: string;
  distrito?: string;
  dni?: string;
  referencia?: string;
}
