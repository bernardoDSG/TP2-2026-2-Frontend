export interface CarStatus {
  id: number;
  nome: string;
}

export interface Carro {
  id: number;
  nome: string;
  statusUso: CarStatus | null;
  cor: {
    id: number;
    nome: string;
    tonalidade?: { id: number; nome: string } | null;
  } | null;
}

export interface CarroPayload {
  nome: string;
  StatusUsoId: number;
  corId: number;
}
