import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rows = await sql`SELECT * FROM fornecedores WHERE id = ${params.id}`;
    if (!rows[0]) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao buscar fornecedor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    if (!body.nome || !body.categoria) {
      return NextResponse.json({ error: 'Nome e categoria são obrigatórios' }, { status: 400 });
    }
    const existing = await sql`SELECT id FROM fornecedores WHERE id = ${params.id}`;
    if (!existing[0]) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

    const rows = await sql`
      UPDATE fornecedores SET
        nome = ${body.nome},
        apelido = ${body.apelido || null},
        whatsapp = ${body.whatsapp || null},
        instagram = ${body.instagram || null},
        banca = ${body.banca || null},
        rua = ${body.rua || null},
        categoria = ${body.categoria},
        categoria_custom = ${body.categoria_custom || null},
        sub_categoria = ${body.sub_categoria || null},
        tipo_venda = ${body.tipo_venda || 'atacado'},
        preco_min = ${body.preco_min ?? null},
        preco_max = ${body.preco_max ?? null},
        pedido_minimo = ${body.pedido_minimo ?? null},
        preco_varejo_min = ${body.preco_varejo_min ?? null},
        preco_varejo_max = ${body.preco_varejo_max ?? null},
        pedido_minimo_varejo = ${body.pedido_minimo_varejo ?? null},
        pagamento = ${body.pagamento || null},
        nota = ${body.nota ?? 0},
        status = ${body.status || 'ativo'},
        observacoes = ${body.observacoes || null},
        atualizado_em = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao atualizar fornecedor' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existing = await sql`SELECT id FROM fornecedores WHERE id = ${params.id}`;
    if (!existing[0]) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    await sql`DELETE FROM fornecedores WHERE id = ${params.id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao excluir fornecedor' }, { status: 500 });
  }
}
