export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  password_hash: string;
  rol: 'cliente' | 'transportista' | 'admin';
  fecha_registro?: string;
}

export interface CreateUsuarioRequest {
  nombre: string;
  email: string;
  password: string;
  rol?: 'cliente' | 'transportista' | 'admin';
}
