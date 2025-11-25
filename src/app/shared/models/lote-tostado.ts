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
}
