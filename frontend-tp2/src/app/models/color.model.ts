export interface ColorTone {
  id: number;
  nome: string;
  ID?: number;
  NOME?: string;
}

export interface Color {
  id: number;
  nome: string;
  tonalidade: ColorTone | null;
}

export interface ColorPayload {
  nome: string;
  tonalidadeId: number;
}
