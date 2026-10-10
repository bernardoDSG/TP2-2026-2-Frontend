export interface Color {
  id: number;
  nome: string;
  tonalidade: string;
}

export interface ColorPayload {
  nome: string;
  tonalidadeId: number;
}
