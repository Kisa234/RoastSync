export interface DireccionEnvio {
  id_direccion: string;
  id_envio: string;
  nombre_destinatario: string;
  telefono: string;
  direccion: string;
  distrito: string;
  provincia: string;
  departamento: string;
  pais: string;
  codigo_postal?: string | null;
  referencia?: string | null;
  observaciones?: string | null;
  fecha_registro: string;
}

export interface CreateDireccionEnvio {
  nombre_destinatario: string;
  telefono: string;
  direccion: string;
  distrito: string;
  provincia: string;
  departamento: string;
  pais?: string;
  codigo_postal?: string;
  referencia?: string;
  observaciones?: string;
}