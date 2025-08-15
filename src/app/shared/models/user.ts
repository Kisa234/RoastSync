export interface User {
  id_user: string;
  nombre: string;
  email: string;
  rol: string;
  password: string;
  numero_telefono: number;
  eliminado: boolean;
  fecha_registro: Date;
  nombre_comercial?:string;
  fecha_editado?: Date;
}
