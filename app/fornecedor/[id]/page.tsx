import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, AtSign, Pencil, MapPin, Package, CreditCard, Calendar } from 'lucide-react';
import { sql } from '@/lib/db';
import { Fornecedor, CATEGORIA_CORES, formatarPreco, formatarWhatsApp, formatarInstagram, cn } from '@/lib/utils';
import { StarRating } from '@/components/StarRating';
import { ArquivosSection } from '@/components/ArquivosSection';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export default async function FornecedorDetalhes({ params }: Props) {
  const rows = await sql`SELECT * FROM fornecedores WHERE id = ${params.id}`;
  const f = rows[0] as Fornecedor | undefined;

  if (!f) notFound();

  const corCategoria = CATEGORIA_CORES[f.categoria] || 'bg-gray-100 text-gray-700';
  const SEP = '||';
  const wppNums = (f.whatsapp || '').split(SEP).map(formatarWhatsApp).filter(Boolean);
  const igUsers = (f.instagram || '').split(SEP).map(formatarInstagram).filter(Boolean);
  const bancas = (f.banca || '').split(SEP).map((s) => s.trim()).filter(Boolean);
  const ruas = (f.rua || '').split(SEP).map((s) => s.trim()).filter(Boolean);
  const localizacoes = Array.from({ length: Math.max(bancas.length, ruas.length) }, (_, i) => ({
    banca: bancas[i] ?? '',
    rua: ruas[i] ?? '',
  })).filter((l) => l.banca || l.rua);
  const pagamentos = f.pagamento ? f.pagamento.split(', ').filter(Boolean) : [];

  const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(f.criado_em));

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/" className="p-2 rounded-xl bg-white border border-[#E8DACE] text-[#8B7B74] hover:text-[#C9747A] hover:border-[#C9747A] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-xl font-bold text-[#1A1A2E] truncate">{f.nome}</h1>
          {f.apelido && <p className="text-xs text-[#8B7B74]">{f.apelido}</p>}
        </div>
        <Link
          href={`/fornecedor/${f.id}/editar`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E8DACE] text-sm font-medium text-[#8B7B74] hover:border-[#C9747A] hover:text-[#C9747A] transition-colors"
        >
          <Pencil size={14} />
          Editar
        </Link>
      </div>

      {/* Status badge + categoria */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className={cn('text-xs font-medium px-3 py-1 rounded-full', corCategoria)}>
          {f.categoria}
        </span>
        {f.sub_categoria && (
          <span className="text-xs text-[#8B7B74] bg-[#F5EFE8] px-3 py-1 rounded-full">
            {f.sub_categoria}
          </span>
        )}
        <span className={cn(
          'text-xs font-medium px-3 py-1 rounded-full ml-auto',
          f.status === 'favorito' && 'bg-rose-50 text-[#C9747A]',
          f.status === 'ativo' && 'bg-green-50 text-[#7FA98D]',
          f.status === 'inativo' && 'bg-red-50 text-[#C96B6B]',
        )}>
          {f.status === 'favorito' ? '❤ Favorito' : f.status === 'ativo' ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      {/* Contact actions */}
      <div className="space-y-2">
        {/* WhatsApp buttons */}
        {wppNums.length > 0 ? (
          <div className={`grid gap-2 ${wppNums.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2'}`}>
            {wppNums.map((num, i) => (
              <a
                key={i}
                href={`https://wa.me/55${num}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-[#7FA98D] text-white rounded-xl font-medium text-sm hover:bg-[#6a9278] transition-colors"
              >
                <MessageCircle size={16} />
                {wppNums.length > 1 ? `WhatsApp ${i + 1}` : 'WhatsApp'}
              </a>
            ))}
            {/* Instagram beside first wpp if only one each */}
            {wppNums.length === 1 && igUsers.length === 1 && (
              <a
                href={`https://instagram.com/${igUsers[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <AtSign size={16} />
                Instagram
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-center gap-2 py-3 bg-[#F5EFE8] text-[#8B7B74]/40 rounded-xl text-sm cursor-not-allowed">
              <MessageCircle size={16} />
              WhatsApp
            </div>
            {igUsers.length === 0 && (
              <div className="flex items-center justify-center gap-2 py-3 bg-[#F5EFE8] text-[#8B7B74]/40 rounded-xl text-sm cursor-not-allowed">
                <AtSign size={16} />
                Instagram
              </div>
            )}
          </div>
        )}

        {/* Extra instagrams (or all if no wpp) */}
        {(igUsers.length > 1 || (wppNums.length !== 1 && igUsers.length === 1)) && (
          <div className={`grid gap-2 ${igUsers.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2'}`}>
            {igUsers.map((user, i) => (
              <a
                key={i}
                href={`https://instagram.com/${user}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <AtSign size={16} />
                {igUsers.length > 1 ? `Instagram ${i + 1}` : 'Instagram'}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Details card */}
      <div className="bg-white rounded-2xl border border-[#E8DACE] divide-y divide-[#E8DACE]">

        {/* Localização */}
        {localizacoes.length > 0 && (
          <div className="p-4 flex items-start gap-3">
            <div className="p-2 bg-[#F5EFE8] rounded-xl"><MapPin size={16} className="text-[#C9747A]" /></div>
            <div className="flex-1">
              <p className="text-xs text-[#8B7B74] font-medium uppercase tracking-wide mb-1">
                {localizacoes.length > 1 ? 'Localizações' : 'Localização'}
              </p>
              <div className="space-y-1">
                {localizacoes.map((loc, i) => (
                  <p key={i} className="text-sm font-medium text-[#1A1A2E]">
                    {[loc.banca && `Banca ${loc.banca}`, loc.rua].filter(Boolean).join(' — ')}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preços Atacado */}
        {(f.preco_min || f.preco_max || f.pedido_minimo) && (f.tipo_venda === 'atacado' || f.tipo_venda === 'ambos') && (
          <div className="p-4 flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <span className="text-blue-600 font-bold text-sm">📦</span>
            </div>
            <div>
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-0.5">Atacado</p>
              {(f.preco_min || f.preco_max) && (
                <p className="text-sm font-medium text-[#1A1A2E]">
                  {f.preco_min && f.preco_max
                    ? `${formatarPreco(f.preco_min)} – ${formatarPreco(f.preco_max)}`
                    : formatarPreco(f.preco_min ?? f.preco_max)}
                </p>
              )}
              {f.pedido_minimo && (
                <p className="text-xs text-[#8B7B74] mt-0.5">Mínimo: {f.pedido_minimo} peças</p>
              )}
            </div>
          </div>
        )}

        {/* Preços Varejo */}
        {(f.preco_varejo_min || f.preco_varejo_max || f.pedido_minimo_varejo) && (f.tipo_venda === 'varejo' || f.tipo_venda === 'ambos') && (
          <div className="p-4 flex items-start gap-3">
            <div className="p-2 bg-rose-50 rounded-xl">
              <span className="text-rose-500 font-bold text-sm">🛍️</span>
            </div>
            <div>
              <p className="text-xs text-rose-500 font-semibold uppercase tracking-wide mb-0.5">Varejo</p>
              {(f.preco_varejo_min || f.preco_varejo_max) && (
                <p className="text-sm font-medium text-[#1A1A2E]">
                  {f.preco_varejo_min && f.preco_varejo_max
                    ? `${formatarPreco(f.preco_varejo_min)} – ${formatarPreco(f.preco_varejo_max)}`
                    : formatarPreco(f.preco_varejo_min ?? f.preco_varejo_max)}
                </p>
              )}
              {f.pedido_minimo_varejo && (
                <p className="text-xs text-[#8B7B74] mt-0.5">Mínimo: {f.pedido_minimo_varejo} peça{f.pedido_minimo_varejo !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
        )}

        {/* Fallback: preço sem tipo definido (dados antigos) */}
        {!f.tipo_venda && (f.preco_min || f.preco_max) && (
          <div className="p-4 flex items-start gap-3">
            <div className="p-2 bg-[#F5EFE8] rounded-xl">
              <Package size={16} className="text-[#D4A373]" />
            </div>
            <div>
              <p className="text-xs text-[#8B7B74] font-medium uppercase tracking-wide mb-0.5">Faixa de Preço</p>
              <p className="text-sm font-medium text-[#1A1A2E]">
                {f.preco_min && f.preco_max
                  ? `${formatarPreco(f.preco_min)} – ${formatarPreco(f.preco_max)}`
                  : formatarPreco(f.preco_min ?? f.preco_max)}
              </p>
              {f.pedido_minimo && <p className="text-xs text-[#8B7B74] mt-0.5">Mínimo: {f.pedido_minimo} peças</p>}
            </div>
          </div>
        )}

        {/* Pagamento */}
        {pagamentos.length > 0 && (
          <div className="p-4 flex items-start gap-3">
            <div className="p-2 bg-[#F5EFE8] rounded-xl"><CreditCard size={16} className="text-[#8B7B74]" /></div>
            <div>
              <p className="text-xs text-[#8B7B74] font-medium uppercase tracking-wide mb-1">Formas de Pagamento</p>
              <div className="flex flex-wrap gap-1.5">
                {pagamentos.map((p) => (
                  <span key={p} className="text-xs bg-[#F5EFE8] text-[#1A1A2E] px-2.5 py-1 rounded-full font-medium">{p}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Avaliação */}
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#8B7B74] font-medium uppercase tracking-wide mb-1">Avaliação</p>
            <StarRating value={f.nota} readonly size="md" />
          </div>
          <div className="text-right">
            <p className="text-xs text-[#8B7B74] font-medium uppercase tracking-wide mb-0.5">Cadastrado em</p>
            <div className="flex items-center gap-1 text-xs text-[#8B7B74]">
              <Calendar size={12} />
              {dataFormatada}
            </div>
          </div>
        </div>

        {/* Observações */}
        {f.observacoes && (
          <div className="p-4">
            <p className="text-xs text-[#8B7B74] font-medium uppercase tracking-wide mb-1.5">Observações</p>
            <p className="text-sm text-[#1A1A2E] whitespace-pre-line">{f.observacoes}</p>
          </div>
        )}
      </div>

      {/* Arquivos */}
      <div className="bg-white rounded-2xl border border-[#E8DACE] p-4">
        <h2 className="font-serif font-bold text-[#1A1A2E] text-base mb-4">Fotos & Documentos</h2>
        <ArquivosSection fornecedorId={f.id} />
      </div>
    </div>
  );
}
