export interface AsignarRutaRequest {
  id_envio: number;
  id_ruta: number;
  id_transportista: number;
}

export interface RutaEnvio {
  id?: number;
  id_envio: number;
  id_ruta: number;
  id_transportista: number;
  fecha_asignacion?: string;
}

export interface RutaEnvioResponse {
  id: number;
  id_envio: number;
  id_ruta: number;
  id_transportista: number;
  fecha_asignacion: string;
  envio: {
    id: number;
    peso: number;
    volumen: number;
    tipo_producto: string;
    estado: string;
  };
  ruta: {
    id: number;
    descripcion: string;
    fecha_hora_inicio: string;
    estado: string;
  };
  transportista: {
    id: number;
    disponibilidad: boolean;
    vehiculo: {
      id: number;
      placa: string;
      tipo: string;
      capacidad: number;
    };
  };
}

export interface TransportistaDisponible {
  id: number;
  disponibilidad: boolean;
  vehiculo: {
    id: number;
    placa: string;
    tipo: string;
    capacidad: number;
  };
}

export interface RutaDisponible {
  id: number;
  descripcion: string;
  fecha_hora_inicio: string;
  estado: string;
}
