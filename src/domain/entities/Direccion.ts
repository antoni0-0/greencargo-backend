export interface Direccion {
  id?: number;
  direccion: string;
  detalle?: string | undefined;
  ciudad: string;
  departamento: string;
  codigo_postal?: string | undefined;
  pais?: string | undefined;
}

export interface CreateDireccionRequest {
  direccion: string;
  detalle?: string | undefined;
  ciudad: string;
  departamento: string;
  codigo_postal?: string | undefined;
  pais?: string | undefined;
}
