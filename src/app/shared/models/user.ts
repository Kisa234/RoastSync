export interface User {
  id_user: string;
  nombre: string;
  nombre_comercial?:string;
  email: string;
  documento_tipo?: string;
  documento_identidad?: string;
  fecha_nacimiento?: Date;
  departamento?: string;
  direccion?: string;
  numero_telefono: number;
  rol: string;
  password: string;
  eliminado: boolean;
  fecha_registro: Date;
  fecha_editado?: Date;
}
