export interface ClientePayload {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  estadoNome: string;
  estadoSigla: string;
}

export interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  municipio: {
    nome: string;
    estado: { nome: string; sigla: string };
  };
}