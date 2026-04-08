import { InventarioLoteTostado } from "./inventario-lote-tostado";
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

export interface LoteTostadoConInventario {
  id_lote_tostado: string;
  id_lote: string;
  fecha_tostado: string;
  perfil_tostado: string;
  peso: number;
  fecha_registro: string;
  id_user: string;

  lote: Lote;

  inventarioLotesTostados: InventarioLoteTostado[];

  id_analisis_rapido?: string;
  entregado?: string;
}