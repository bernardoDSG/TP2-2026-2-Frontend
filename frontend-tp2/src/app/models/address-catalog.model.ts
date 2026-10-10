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
  estadoId: number;
  estadoNome: string;
  estadoSigla: string;
}

export interface MunicipioPayload {
  nome: string;
  estadoId: number;
}