import { Envio, EnvioResponse, EstadoEnvioHistorial } from '../entities/Envio';

export interface EnvioRepository {
  create(envio: Envio): Promise<Envio>;
  findById(id: number): Promise<EnvioResponse | null>;
  findByUsuarioId(usuarioId: number): Promise<EnvioResponse[]>;
  updateEstado(id: number, estado: number): Promise<boolean>;
  getAllEnvios(estadoId?: number): Promise<EnvioResponse[]>;
  getHistorialEstados(envioId: number): Promise<EstadoEnvioHistorial[]>;
  saveEstadoEnvio(envioId: number, estadoId: number, comentario?: string): Promise<boolean>;
}
