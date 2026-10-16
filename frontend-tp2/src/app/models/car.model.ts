export interface Carro {
  id: number;
  nome: string;
  statusUso: 'SEMINOVO' | 'USADO';
  nomeCarro: string;
  statusUsoId: number;
  marcaId: number;
  marcaNome: string;
  categoriaId: number;
  categoriaNome: string;
  corId: number;
  corNome: string;
  tonalidade: string;
  imagemUrl: string | null;
}

export interface CarroPayload {
  nome: string;
  StatusUsoId: number;
  corId: number;
  marcaId: number;
  categoriaId: number;
}
