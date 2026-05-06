import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { FornecedorForm } from '@/components/FornecedorForm';

export default function NovoFornecedor() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/" className="p-2 rounded-xl bg-white border border-[#E8DACE] text-[#8B7B74] hover:text-[#C9747A] hover:border-[#C9747A] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-serif text-xl font-bold text-[#1A1A2E]">Novo Fornecedor</h1>
          <p className="text-xs text-[#8B7B74]">Preencha os dados do fornecedor</p>
        </div>
      </div>
      <FornecedorForm mode="create" />
    </div>
  );
}
