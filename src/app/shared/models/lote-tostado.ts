import { Lote } from "./lote";

export interface LoteTostado {
  id_lote_tostado: string;
  id_lote: string;
  fecha_tostado: Date;
  perfil_tostado: string;
  peso: number;
  fecha_registro: Date;
  id_user:string;
  id_analisis_rapido?: string;
  entregado?: Date;
  eliminado?: boolean;
  productor?: string;
}

export interface LoteTostadoConLote {
  id_lote_tostado: string;
  id_lote: string;
  fecha_tostado: Date;
  perfil_tostado: string;
  peso: number;
  fecha_registro: Date;
  id_user: string;
  lote: Lote;
  id_analisis_rapido?: string;
  entregado?: Date;
}