export interface User {
  id_user: string;
  nombre: string;
  email: string;
  rol: string;
  password: string;
  numero_telefono: number;
  eliminado: boolean;
  fecha_registro: Date;
  fecha_editado?: Date;
}
