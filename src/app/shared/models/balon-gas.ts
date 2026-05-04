export type EstadoBalonGas = 'DISPONIBLE' | 'EN_USO' | 'FINALIZADO';

export interface BalonGas {
  id_balon_gas: string;

  fecha_ingreso: string;
  fecha_inicio_uso?: string;
  fecha_fin_uso?: string;

  id_tueste_inicio?: string;
  id_tueste_fin?: string;

  estado: EstadoBalonGas;

  precio: number;

  id_user_ingreso: string;
  id_user_inicio_uso?: string;
  id_user_fin_uso?: string;

  created_at?: string;
  updated_at?: string;
}

export interface CreateBalonGasRequest {
  precio: number;
}

export interface StartBalonGasRequest {
  id_balon_gas: string;
  id_tueste_inicio: string;
}

export interface FinalizeBalonGasRequest {
  id_balon_gas: string;
  id_tueste_fin: string;
}

export type BalonGasModalMode = 'CREATE' | 'START' | 'VIEW';

export interface BalonGasModalData {
  mode: BalonGasModalMode;
  balon?: BalonGas;
  id_tueste?: string;
}