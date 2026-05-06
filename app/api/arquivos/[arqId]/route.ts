import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { sql } from '@/lib/db';

export async function DELETE(_req: NextRequest, { params }: { params: { arqId: string } }) {
  try {
    const rows = await sql`SELECT * FROM fornecedor_arquivos WHERE id = ${params.arqId}`;
    const arq = rows[0] as { caminho: string } | undefined;
    if (!arq) return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });

    try {
      await del(arq.caminho);
    } catch {
      // Arquivo pode não existir no blob — continua
    }

    await sql`DELETE FROM fornecedor_arquivos WHERE id = ${params.arqId}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao excluir arquivo' }, { status: 500 });
  }
}
