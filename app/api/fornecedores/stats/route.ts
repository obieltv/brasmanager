import { NextResponse } from 'next/server';
import { sql, initializeDb } from '@/lib/db';

export async function GET() {
  try {
    await initializeDb();
    const [totais, mediaRow, porCategoria] = await Promise.all([
      sql`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'favorito') AS favoritos,
          COUNT(*) FILTER (WHERE status = 'ativo') AS ativos,
          COUNT(*) FILTER (WHERE status = 'inativo') AS inativos
        FROM fornecedores
      `,
      sql`
        SELECT AVG((COALESCE(preco_min,0) + COALESCE(preco_max,0)) / 2.0) AS media
        FROM fornecedores
        WHERE preco_min IS NOT NULL OR preco_max IS NOT NULL
      `,
      sql`
        SELECT categoria, COUNT(*) AS count
        FROM fornecedores
        GROUP BY categoria
        ORDER BY count DESC
        LIMIT 5
      `,
    ]);

    const t = totais[0];
    return NextResponse.json({
      total: parseInt(String(t.total)),
      favoritos: parseInt(String(t.favoritos)),
      ativos: parseInt(String(t.ativos)),
      inativos: parseInt(String(t.inativos)),
      media_preco: mediaRow[0]?.media ?? null,
      por_categoria: porCategoria,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
