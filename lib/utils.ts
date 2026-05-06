import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CATEGORIAS = [
  'Vestidos',
  'Blusas',
  'Calças',
  'Shorts & Saias',
  'Lingerie & Pijamas',
  'Moda Praia',
  'Moda Íntima',
  'Acessórios',
  'Calçados',
  'Plus Size',
  'Moda Bebê & Infantil',
  'Conjuntos',
  'Jeans',
  'Básicos',
  'Festa & Noite',
  'Outros',
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export const CATEGORIA_CORES: Record<string, string> = {
  'Vestidos': 'bg-pink-100 text-pink-700',
  'Blusas': 'bg-purple-100 text-purple-700',
  'Calças': 'bg-blue-100 text-blue-700',
  'Shorts & Saias': 'bg-orange-100 text-orange-700',
  'Lingerie & Pijamas': 'bg-rose-100 text-rose-700',
  'Moda Praia': 'bg-cyan-100 text-cyan-700',
  'Moda Íntima': 'bg-fuchsia-100 text-fuchsia-700',
  'Acessórios': 'bg-amber-100 text-amber-700',
  'Calçados': 'bg-brown-100 text-yellow-800',
  'Plus Size': 'bg-violet-100 text-violet-700',
  'Moda Bebê & Infantil': 'bg-lime-100 text-lime-700',
  'Conjuntos': 'bg-teal-100 text-teal-700',
  'Jeans': 'bg-indigo-100 text-indigo-700',
  'Básicos': 'bg-gray-100 text-gray-700',
  'Festa & Noite': 'bg-red-100 text-red-700',
  'Outros': 'bg-slate-100 text-slate-700',
};

export const FORMAS_PAGAMENTO = [
  'PIX',
  'Dinheiro',
  'Boleto',
  'Cartão de Crédito',
  'Crediário',
];

export interface Arquivo {
  id: number;
  fornecedor_id: number;
  nome: string;
  tipo: 'foto' | 'pdf' | 'outro';
  caminho: string;
  tamanho: number | null;
  criado_em: string;
}

export interface Fornecedor {
  id: number;
  nome: string;
  apelido: string | null;
  whatsapp: string | null;
  instagram: string | null;
  banca: string | null;
  rua: string | null;
  categoria: string;
  categoria_custom: string | null;
  sub_categoria: string | null;
  tipo_venda: 'atacado' | 'varejo' | 'ambos';
  preco_min: number | null;
  preco_max: number | null;
  pedido_minimo: number | null;
  preco_varejo_min: number | null;
  preco_varejo_max: number | null;
  pedido_minimo_varejo: number | null;
  pagamento: string | null;
  nota: number;
  status: 'ativo' | 'inativo' | 'favorito';
  observacoes: string | null;
  criado_em: string;
  atualizado_em: string;
  // contagens vindas do JOIN na listagem
  fotos_count?: number;
  pdfs_count?: number;
}

export function formatarWhatsApp(numero: string | null): string {
  if (!numero) return '';
  return numero.replace(/\D/g, '');
}

export function formatarInstagram(ig: string | null): string {
  if (!ig) return '';
  const match = ig.match(/@?([a-zA-Z0-9_.]+)\/?$/);
  return match ? match[1] : ig;
}

export function formatarPreco(valor: number | null): string {
  if (valor === null || valor === undefined) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

export function aplicarMascaraTelefone(valor: string): string {
  const digits = valor.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
