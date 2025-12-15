import { Lote } from "./lote";

export interface BoxOpcion {
  id_opcion: string;
  id_box_template: string;
  id_cafe: string;


  lote?: Lote;
  notas: string[];
}
