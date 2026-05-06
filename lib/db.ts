import { neon, Pool } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL!);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

export async function initializeDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS fornecedores (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      apelido TEXT,
      whatsapp TEXT,
      instagram TEXT,
      banca TEXT,
      rua TEXT,
      categoria TEXT NOT NULL,
      categoria_custom TEXT,
      sub_categoria TEXT,
      tipo_venda TEXT DEFAULT 'atacado',
      preco_min REAL,
      preco_max REAL,
      pedido_minimo INTEGER,
      preco_varejo_min REAL,
      preco_varejo_max REAL,
      pedido_minimo_varejo INTEGER,
      pagamento TEXT,
      nota INTEGER DEFAULT 0,
      status TEXT DEFAULT 'ativo',
      observacoes TEXT,
      criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS fornecedor_arquivos (
      id SERIAL PRIMARY KEY,
      fornecedor_id INTEGER NOT NULL REFERENCES fornecedores(id) ON DELETE CASCADE,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL,
      caminho TEXT NOT NULL,
      tamanho INTEGER,
      criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
}
