export type TipoVaga = 'NORMAL' | 'COBERTA' | 'PREFERENCIAL';

export interface Setor {
  id: number;
  nome: string;
  linhas: number;
  colunas: number;
}

export interface SetorPayload {
  nome: string;
  linhas: number;
  colunas: number;
}

export interface Vaga {
  id: number;
  codigoVaga: string;
  linha: number;
  coluna: number;
  tipo: TipoVaga;
  setorId: number;
  setorNome: string;
  carroId: number | null;
  carroNome: string | null;
}

export interface VagaPayload {
  codigoVaga: string;
  linha: number;
  coluna: number;
  tipo: TipoVaga;
  setorId: number;
  carroId: number | null;
}
