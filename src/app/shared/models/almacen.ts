export interface Almacen {
  id_almacen: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  created_at?: string;
}

export interface CreateAlmacenDto {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export type UpdateAlmacenDto = Partial<CreateAlmacenDto>;
