'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, AtSign, Pencil, Package, MapPin, ImageIcon } from 'lucide-react';
import { Fornecedor, CATEGORIA_CORES, formatarPreco, formatarWhatsApp, formatarInstagram, cn } from '@/lib/utils';
import { StarRating } from './StarRating';
import { ArquivosModal } from './ArquivosModal';
import { toast } from 'sonner';

interface FornecedorCardProps {
  fornecedor: Fornecedor;
  onToggleFavorito?: (f: Fornecedor) => void;
}

export function FornecedorCard({ fornecedor: f, onToggleFavorito }: FornecedorCardProps) {
  const corCategoria = CATEGORIA_CORES[f.categoria] || 'bg-gray-100 text-gray-700';
  const isFavorito = f.status === 'favorito';
  const [modalOpen, setModalOpen] = useState(false);
  const [fotosCount, setFotosCount] = useState(f.fotos_count ?? 0);
  const [pdfsCount, setPdfsCount] = useState(f.pdfs_count ?? 0);
  const totalArquivos = fotosCount + pdfsCount;

  const handleWhatsApp = () => {
    const num = formatarWhatsApp(f.whatsapp);
    if (!num) { toast.error('WhatsApp não cadastrado'); return; }
    window.open(`https://wa.me/55${num}`, '_blank');
  };

  const handleAtSign = () => {
    const user = formatarInstagram(f.instagram);
    if (!user) { toast.error('AtSign não cadastrado'); return; }
    window.open(`https://instagram.com/${user}`, '_blank');
  };

  const handleFavorito = async () => {
    const novoStatus = isFavorito ? 'ativo' : 'favorito';
    try {
      await fetch(`/api/fornecedores/${f.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, status: novoStatus }),
      });
      onToggleFavorito?.({ ...f, status: novoStatus });
      toast.success(isFavorito ? 'Removido dos favoritos' : 'Adicionado aos favoritos!');
    } catch {
      toast.error('Erro ao atualizar favorito');
    }
  };

  return (
    <div className={cn(
      'bg-white rounded-2xl border border-[#E8DACE] shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3 transition-shadow hover:shadow-[0_4px_24px_rgba(201,116,122,0.12)]',
      f.status === 'inativo' && 'opacity-60'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/fornecedor/${f.id}`} className="hover:text-[#C9747A] transition-colors">
            <h3 className="font-semibold text-[#1A1A2E] text-sm leading-tight truncate">
              {f.nome}
              {f.apelido && <span className="text-[#8B7B74] font-normal"> ({f.apelido})</span>}
            </h3>
          </Link>
          <span className={cn('inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full', corCategoria)}>
            {f.categoria}
          </span>
        </div>
        <button
          onClick={handleFavorito}
          className="shrink-0 p-1.5 rounded-full hover:bg-rose-50 transition-colors"
          title={isFavorito ? 'Remover favorito' : 'Favoritar'}
        >
          <Heart
            size={16}
            className={cn(isFavorito ? 'fill-[#C9747A] text-[#C9747A]' : 'text-[#8B7B74]')}
          />
        </button>
      </div>

      {/* Location — first entry only */}
      {(f.banca || f.rua) && (
        <div className="flex items-center gap-1.5 text-xs text-[#8B7B74]">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">
            {[f.banca?.split('||')[0] && `Banca ${f.banca?.split('||')[0]}`, f.rua?.split('||')[0]].filter(Boolean).join(' — ')}
          </span>
        </div>
      )}

      {/* Prices por tipo de venda */}
      <div className="space-y-1 text-xs">
        {(f.tipo_venda === 'atacado' || f.tipo_venda === 'ambos' || !f.tipo_venda) && (f.preco_min || f.preco_max) && (
          <div className="flex items-center gap-1.5">
            <span className="text-blue-500">📦</span>
            <span className="text-blue-600 font-medium">
              {f.preco_min && f.preco_max
                ? `${formatarPreco(f.preco_min)} – ${formatarPreco(f.preco_max)}`
                : formatarPreco(f.preco_min ?? f.preco_max)}
            </span>
            {f.pedido_minimo && <span className="text-[#8B7B74]">· mín. {f.pedido_minimo} pç</span>}
          </div>
        )}
        {(f.tipo_venda === 'varejo' || f.tipo_venda === 'ambos') && (f.preco_varejo_min || f.preco_varejo_max) && (
          <div className="flex items-center gap-1.5">
            <span>🛍️</span>
            <span className="text-rose-500 font-medium">
              {f.preco_varejo_min && f.preco_varejo_max
                ? `${formatarPreco(f.preco_varejo_min)} – ${formatarPreco(f.preco_varejo_max)}`
                : formatarPreco(f.preco_varejo_min ?? f.preco_varejo_max)}
            </span>
            {f.pedido_minimo_varejo && <span className="text-[#8B7B74]">· mín. {f.pedido_minimo_varejo} pç</span>}
          </div>
        )}
      </div>

      {/* Fallback pedido mínimo sem preço */}
      {!f.preco_min && !f.preco_max && !f.preco_varejo_min && !f.preco_varejo_max && f.pedido_minimo && (
        <div className="flex items-center gap-1 text-xs text-[#8B7B74]">
          <Package size={12} />
          <span>Mín. {f.pedido_minimo} pç</span>
        </div>
      )}

      {/* Stars + Status */}
      <div className="flex items-center justify-between">
        <StarRating value={f.nota} readonly size="sm" />
        {f.status === 'inativo' && (
          <span className="text-xs text-[#C96B6B] bg-red-50 px-2 py-0.5 rounded-full">Inativo</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-[#E8DACE]">
        <button
          onClick={handleWhatsApp}
          disabled={!f.whatsapp}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg bg-[#F5EFE8] text-[#1A1A2E] hover:bg-[#7FA98D] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <MessageCircle size={13} />
          WhatsApp
        </button>
        <button
          onClick={handleAtSign}
          disabled={!f.instagram}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg bg-[#F5EFE8] text-[#1A1A2E] hover:bg-purple-500 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <AtSign size={13} />
          Instagram
        </button>
        <button
          onClick={() => setModalOpen(true)}
          className="relative flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-[#F5EFE8] text-[#C9747A] hover:bg-[#C9747A] hover:text-white transition-colors"
          title="Fotos e documentos"
        >
          <ImageIcon size={13} />
          {totalArquivos > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#C9747A] text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold leading-none group-hover:bg-white group-hover:text-[#C9747A]">
              {totalArquivos}
            </span>
          )}
        </button>
        <Link
          href={`/fornecedor/${f.id}/editar`}
          className="flex items-center justify-center px-3 py-1.5 rounded-lg bg-[#F5EFE8] text-[#8B7B74] hover:bg-[#C9747A] hover:text-white transition-colors"
        >
          <Pencil size={13} />
        </Link>
      </div>

      {modalOpen && (
        <ArquivosModal
          fornecedorId={f.id}
          nomeFornecedor={f.nome}
          initialTab="foto"
          onClose={() => setModalOpen(false)}
          onCountChange={(fotos, pdfs) => { setFotosCount(fotos); setPdfsCount(pdfs); }}
        />
      )}
    </div>
  );
}
