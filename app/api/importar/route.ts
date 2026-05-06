import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fornecedores: Record<string, unknown>[] = body.fornecedores;
    if (!Array.isArray(fornecedores)) {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 });
    }

    let inserted = 0;
    let skipped = 0;

    for (const item of fornecedores) {
      const wpp = String(item['WhatsApp'] || item['whatsapp'] || '').trim();
      if (wpp) {
        const exists = await sql`SELECT id FROM fornecedores WHERE whatsapp = ${wpp}`;
        if (exists.length > 0) { skipped++; continue; }
      }
      await sql`
        INSERT INTO fornecedores
          (nome, apelido, whatsapp, instagram, banca, rua, categoria, sub_categoria,
           preco_min, preco_max, pedido_minimo, pagamento, nota, status, observacoes)
        VALUES
          (${String(item['Nome'] || item['nome'] || 'Sem nome').trim()},
           ${String(item['Apelido'] || item['apelido'] || '').trim() || null},
           ${wpp || null},
           ${String(item['Instagram'] || item['instagram'] || '').trim() || null},
           ${String(item['Banca'] || item['banca'] || '').trim() || null},
           ${String(item['Rua/Galeria'] || item['rua'] || '').trim() || null},
           ${String(item['Categoria'] || item['categoria'] || 'Outros').trim()},
           ${String(item['Sub-categoria'] || item['sub_categoria'] || '').trim() || null},
           ${item['Preço Mínimo'] != null && item['Preço Mínimo'] !== '' ? parseFloat(String(item['Preço Mínimo'])) : null},
           ${item['Preço Máximo'] != null && item['Preço Máximo'] !== '' ? parseFloat(String(item['Preço Máximo'])) : null},
           ${item['Pedido Mínimo'] != null && item['Pedido Mínimo'] !== '' ? parseInt(String(item['Pedido Mínimo'])) : null},
           ${String(item['Pagamento'] || item['pagamento'] || '').trim() || null},
           ${parseInt(String(item['Nota'] || item['nota'] || '0')) || 0},
           ${String(item['Status'] || item['status'] || 'ativo').trim()},
           ${String(item['Observações'] || item['observacoes'] || '').trim() || null})
      `;
      inserted++;
    }

    return NextResponse.json({ success: true, inserted, skipped });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao importar' }, { status: 500 });
  }
}
