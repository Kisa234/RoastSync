// raw (lo que viene en el JSON)
export interface DepartamentoRaw {
  id: number;
  departamento: string;
  ubigeo: string;
}

export interface ProvinciaRaw {
  id: number;
  provincia: string;
  ubigeo: string;
  departamento_id: number;
}

export interface DistritoRaw{
  id:number;
  distrito:string;
  ubigeo:string;
  provincia_id:string;
  departamento_id:number;
}

// tipos limpios para los selects
export interface Departamento {
  id: number;
  nombre: string;
  codigo: string;
}

export interface Provincia {
  id: number;
  nombre: string;
  codigo: string;
  departamentoId: number;
}

export interface Distrito{
  id:number;
  nombre:string;
  codigo:string;
  departamentoId: number;
}
