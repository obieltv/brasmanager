import { NextRequest, NextResponse } from 'next/server';
import { sql, query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const categoria = searchParams.get('categoria') || '';
    const status = searchParams.get('status') || '';
    const preco_min = searchParams.get('preco_min');
    const preco_max = searchParams.get('preco_max');
    const orderBy = searchParams.get('orderBy') || 'nome';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const orderMap: Record<string, string> = {
      nome: 'f.nome ASC',
      nota: 'f.nota DESC',
      preco: 'f.preco_min ASC',
      data: 'f.criado_em DESC',
    };
    const order = orderMap[orderBy] || 'f.nome ASC';

    const conditions: string[] = [];
    const qParams: (string | number)[] = [];
    let idx = 1;

    if (search) {
      const s = `%${search}%`;
      conditions.push(`(f.nome ILIKE $${idx} OR f.apelido ILIKE $${idx + 1} OR f.banca ILIKE $${idx + 2} OR f.rua ILIKE $${idx + 3})`);
      qParams.push(s, s, s, s);
      idx += 4;
    }
    if (categoria) { conditions.push(`f.categoria = $${idx++}`); qParams.push(categoria); }
    if (status)    { conditions.push(`f.status = $${idx++}`);    qParams.push(status); }
    if (preco_min) {
      conditions.push(`(f.preco_min >= $${idx} OR f.preco_max >= $${idx})`);
      qParams.push(parseFloat(preco_min)); idx++;
    }
    if (preco_max) {
      conditions.push(`(f.preco_min <= $${idx} OR f.preco_max <= $${idx})`);
      qParams.push(parseFloat(preco_max)); idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const rows = await query(
      `SELECT f.*,
        (SELECT COUNT(*) FROM fornecedor_arquivos WHERE fornecedor_id = f.id AND tipo = 'foto') AS fotos_count,
        (SELECT COUNT(*) FROM fornecedor_arquivos WHERE fornecedor_id = f.id AND tipo = 'pdf') AS pdfs_count
       FROM fornecedores f
       ${where} ORDER BY ${order} LIMIT $${idx} OFFSET $${idx + 1}`,
      [...qParams, limit, offset]
    );

    const totalRows = await query(
      `SELECT COUNT(*) as count FROM fornecedores f ${where}`,
      qParams
    );
    const total = parseInt(String(totalRows[0].count));

    return NextResponse.json({ data: rows, total, page, limit });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao buscar fornecedores' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.nome || !body.categoria) {
      return NextResponse.json({ error: 'Nome e categoria são obrigatórios' }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO fornecedores
        (nome, apelido, whatsapp, instagram, banca, rua, categoria, categoria_custom, sub_categoria,
         tipo_venda, preco_min, preco_max, pedido_minimo,
         preco_varejo_min, preco_varejo_max, pedido_minimo_varejo,
         pagamento, nota, status, observacoes)
      VALUES
        (${body.nome}, ${body.apelido || null}, ${body.whatsapp || null}, ${body.instagram || null},
         ${body.banca || null}, ${body.rua || null}, ${body.categoria}, ${body.categoria_custom || null},
         ${body.sub_categoria || null}, ${body.tipo_venda || 'atacado'},
         ${body.preco_min ?? null}, ${body.preco_max ?? null}, ${body.pedido_minimo ?? null},
         ${body.preco_varejo_min ?? null}, ${body.preco_varejo_max ?? null}, ${body.pedido_minimo_varejo ?? null},
         ${body.pagamento || null}, ${body.nota ?? 0}, ${body.status || 'ativo'}, ${body.observacoes || null})
      RETURNING *
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao criar fornecedor' }, { status: 500 });
  }
}
