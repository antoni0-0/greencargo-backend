import { RutaEnvio, RutaEnvioResponse, TransportistaDisponible, RutaDisponible } from '../entities/AsignarRuta';

export interface RutaEnvioRepository {
  create(rutaEnvio: RutaEnvio): Promise<RutaEnvio>;
  findById(id: number): Promise<RutaEnvioResponse | null>;
  findByEnvioId(envioId: number): Promise<RutaEnvioResponse | null>;
  getTransportistasDisponibles(): Promise<TransportistaDisponible[]>;
  getRutasDisponibles(): Promise<RutaDisponible[]>;
  verificarDisponibilidadTransportista(transportistaId: number): Promise<boolean>;
  verificarCapacidadVehiculo(transportistaId: number, peso: number, volumen: number): Promise<boolean>;
}
