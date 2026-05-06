import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { sql } from '@/lib/db';

const MAX_SIZE = 20 * 1024 * 1024;

function detectTipo(filename: string, mimeType: string): 'foto' | 'pdf' | 'outro' {
  if (mimeType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf')) return 'pdf';
  if (mimeType.startsWith('image/')) return 'foto';
  return 'outro';
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rows = await sql`
      SELECT * FROM fornecedor_arquivos
      WHERE fornecedor_id = ${params.id}
      ORDER BY criado_em DESC
    `;
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao listar arquivos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const exists = await sql`SELECT id FROM fornecedores WHERE id = ${params.id}`;
    if (!exists[0]) return NextResponse.json({ error: 'Fornecedor não encontrado' }, { status: 404 });

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    if (!files.length) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });

    const salvos = [];
    for (const file of files) {
      if (file.size > MAX_SIZE) continue;

      const tipo = detectTipo(file.name, file.type);
      const blob = await put(`uploads/${params.id}/${Date.now()}-${file.name}`, file, { access: 'public' });

      const rows = await sql`
        INSERT INTO fornecedor_arquivos (fornecedor_id, nome, tipo, caminho, tamanho)
        VALUES (${parseInt(params.id)}, ${file.name}, ${tipo}, ${blob.url}, ${file.size})
        RETURNING *
      `;
      salvos.push(rows[0]);
    }

    return NextResponse.json({ salvos, total: salvos.length }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 });
  }
}
