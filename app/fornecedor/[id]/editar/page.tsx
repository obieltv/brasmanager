import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { sql } from '@/lib/db';
import { Fornecedor } from '@/lib/utils';
import { FornecedorForm } from '@/components/FornecedorForm';
import { ArquivosSection } from '@/components/ArquivosSection';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export default async function EditarFornecedor({ params }: Props) {
  const rows = await sql`SELECT * FROM fornecedores WHERE id = ${params.id}`;
  const f = rows[0] as Fornecedor | undefined;

  if (!f) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/fornecedor/${f.id}`} className="p-2 rounded-xl bg-white border border-[#E8DACE] text-[#8B7B74] hover:text-[#C9747A] hover:border-[#C9747A] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-serif text-xl font-bold text-[#1A1A2E]">Editar Fornecedor</h1>
          <p className="text-xs text-[#8B7B74] truncate max-w-[200px]">{f.nome}</p>
        </div>
      </div>
      <FornecedorForm mode="edit" initial={f} />

      <div className="bg-white rounded-2xl border border-[#E8DACE] p-4">
        <h2 className="font-serif font-bold text-[#1A1A2E] text-base mb-4">Fotos & Documentos</h2>
        <ArquivosSection fornecedorId={f.id} />
      </div>
    </div>
  );
}
