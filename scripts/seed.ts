import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
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
      tipo TEXT NOT NULL,
      nome TEXT NOT NULL,
      caminho TEXT NOT NULL,
      criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  const existing = await sql`SELECT COUNT(*) as c FROM fornecedores`;
  const count = parseInt(String(existing[0].c));
  if (count > 0) {
    console.log(`⏭  Seed ignorado — ${count} fornecedores já existem.`);
    process.exit(0);
  }

  const fornecedores = [
    {
      nome: 'Modas Bella', apelido: 'Bella', whatsapp: '(11) 91111-1001',
      instagram: '@modasbella', banca: '47', rua: 'Galeria Cristal',
      categoria: 'Vestidos', sub_categoria: 'Vestidos florais e casuais',
      preco_min: 28, preco_max: 85, pedido_minimo: 12,
      pagamento: 'PIX, Dinheiro', nota: 5, status: 'favorito',
      observacoes: 'Ótima qualidade no acabamento, sempre tem novidade na segunda-feira cedo.',
    },
    {
      nome: 'Atacado Vitória Fashion', apelido: 'Vitória', whatsapp: '(11) 92222-2002',
      instagram: '@vitoriafashion_bras', banca: '15B', rua: 'Rua Oriente',
      categoria: 'Conjuntos', sub_categoria: 'Conjuntos de verão',
      preco_min: 35, preco_max: 120, pedido_minimo: 6,
      pagamento: 'PIX, Boleto, Cartão de Crédito', nota: 4, status: 'ativo',
      observacoes: 'Boleto para pedidos acima de R$ 500. Entrega rápida.',
    },
    {
      nome: 'Lingerie Requinte', apelido: null, whatsapp: '(11) 93333-3003',
      instagram: '@linguerierequinte', banca: '22', rua: 'Galeria do Brás',
      categoria: 'Lingerie & Pijamas', sub_categoria: 'Lingerie fina e pijamas',
      preco_min: 15, preco_max: 55, pedido_minimo: 24,
      pagamento: 'PIX, Dinheiro, Crediário', nota: 4, status: 'ativo',
      observacoes: 'Peças com embalagem premium, bom para revenda.',
    },
    {
      nome: 'Plus Moda Inclusiva', apelido: 'Plus', whatsapp: '(11) 94444-4004',
      instagram: '@plusmodainclusiva', banca: '8', rua: 'Rua Bresser',
      categoria: 'Plus Size', sub_categoria: 'Vestidos e blusas plus',
      preco_min: 32, preco_max: 98, pedido_minimo: 8,
      pagamento: 'PIX, Boleto', nota: 5, status: 'favorito',
      observacoes: 'Especializada em GG ao EEG. Atendimento excelente, faz pedido personalizado.',
    },
    {
      nome: 'Acessórios da Manu', apelido: 'Manu', whatsapp: '(11) 95555-5005',
      instagram: '@acessoriosdamanu', banca: '33A', rua: 'Galeria Tropical',
      categoria: 'Acessórios', sub_categoria: 'Cintos, bolsas e bijuterias',
      preco_min: 8, preco_max: 45, pedido_minimo: 30,
      pagamento: 'PIX, Dinheiro, Cartão de Crédito', nota: 3, status: 'ativo',
      observacoes: 'Preço bom mas prazo de reposição pode demorar 2 semanas.',
    },
  ];

  for (const f of fornecedores) {
    await sql`
      INSERT INTO fornecedores
        (nome, apelido, whatsapp, instagram, banca, rua, categoria, sub_categoria,
         preco_min, preco_max, pedido_minimo, pagamento, nota, status, observacoes)
      VALUES
        (${f.nome}, ${f.apelido ?? null}, ${f.whatsapp}, ${f.instagram},
         ${f.banca}, ${f.rua}, ${f.categoria}, ${f.sub_categoria ?? null},
         ${f.preco_min}, ${f.preco_max}, ${f.pedido_minimo},
         ${f.pagamento}, ${f.nota}, ${f.status}, ${f.observacoes})
    `;
  }

  console.log(`✅ Seed concluído! ${fornecedores.length} fornecedores inseridos.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
