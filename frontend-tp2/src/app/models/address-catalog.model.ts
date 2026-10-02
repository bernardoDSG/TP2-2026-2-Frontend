export interface Estado {
  id: number;
  nome: string;
  sigla: string;
}

export interface EstadoPayload {
  nome: string;
  sigla: string;
}

export interface Municipio {
  id: number;
  nome: string;
  estado: Estado;
}

export interface MunicipioPayload {
  nome: string;
  estadoId: number;
}