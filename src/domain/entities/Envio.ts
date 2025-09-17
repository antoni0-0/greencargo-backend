export interface Envio {
  id?: number;
  id_usuario: number;
  id_direccion: number;
  id_estado_actual: number;
  peso: number;
  largo: number;
  ancho: number;
  alto: number;
  volumen: number;
  tipo_producto: string;
  fecha_creacion?: string;
}

export interface CreateEnvioRequest {
  id_usuario: number;
  direccion: {
    direccion: string;
    detalle?: string | undefined;
    ciudad: string;
    departamento: string;
    codigo_postal?: string;
    pais?: string;
  };
  peso: number;
  largo: number;
  ancho: number;
  alto: number;
  tipo_producto: string;
}

export interface EnvioResponse {
  id: number;
  id_usuario: number;
  id_direccion: number;
  id_estado_actual: number;
  peso: number;
  largo: number;
  ancho: number;
  alto: number;
  volumen: number;
  tipo_producto: string;
  fecha_creacion: string;
  direccion: {
    id: number;
    direccion: string;
    detalle?: string;
    ciudad: string;
    departamento: string;
    codigo_postal?: string;
    pais: string;
  };
  estado: {
    id: number;
    descripcion: string;
  };
}

export interface EstadoEnvioHistorial {
  id: number;
  id_envio: number;
  id_estado: number;
  fecha_cambio: string;
  comentario?: string;
  estado: {
    id: number;
    descripcion: string;
  };
}
