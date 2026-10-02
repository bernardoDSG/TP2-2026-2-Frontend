export interface ClientePayload {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  enderecos: EnderecoPayload[];
}

export interface EnderecoPayload {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipioId: number;
}

export interface ClienteEndereco {
  id: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  municipio: {
    id: number;
    nome: string;
    estado: { id: number; nome: string; sigla: string };
  };
}

export interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  enderecos: ClienteEndereco[];
}