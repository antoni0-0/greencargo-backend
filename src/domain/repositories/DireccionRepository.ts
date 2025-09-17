import { Direccion } from '../entities/Direccion';

export interface DireccionRepository {
  create(direccion: Direccion): Promise<Direccion>;
}
