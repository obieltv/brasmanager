import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import Papa from 'papaparse';

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM fornecedores ORDER BY nome ASC`;

    const mapped = rows.map((r) => ({
      'ID': r.id,
      'Nome': r.nome,
      'Apelido': r.apelido ?? '',
      'WhatsApp': r.whatsapp ?? '',
      'Instagram': r.instagram ?? '',
      'Banca': r.banca ?? '',
      'Rua/Galeria': r.rua ?? '',
      'Categoria': r.categoria,
      'Sub-categoria': r.sub_categoria ?? '',
      'Preço Mínimo': r.preco_min ?? '',
      'Preço Máximo': r.preco_max ?? '',
      'Pedido Mínimo': r.pedido_minimo ?? '',
      'Pagamento': r.pagamento ?? '',
      'Nota': r.nota,
      'Status': r.status,
      'Observações': r.observacoes ?? '',
      'Criado em': r.criado_em,
    }));

    const csv = Papa.unparse(mapped, { delimiter: ';' });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="fornecedores-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao exportar' }, { status: 500 });
  }
}
