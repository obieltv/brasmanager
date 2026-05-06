'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { FiltrosBar, Filtros } from '@/components/FiltrosBar';
import { FornecedorCard } from '@/components/FornecedorCard';
import { Fornecedor } from '@/lib/utils';

const LIMIT = 24;

const DEFAULT_FILTROS: Filtros = {
  search: '',
  categoria: '',
  status: '',
  preco_min: '',
  preco_max: '',
  orderBy: 'nome',
};

export default function FornecedoresPage() {
  const [filtros, setFiltros] = useState<Filtros>(DEFAULT_FILTROS);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const lenRef = useRef(0);

  const buildQuery = useCallback((p: number) => {
    const params = new URLSearchParams();
    if (filtros.search) params.set('search', filtros.search);
    if (filtros.categoria) params.set('categoria', filtros.categoria);
    if (filtros.status) params.set('status', filtros.status);
    if (filtros.preco_min) params.set('preco_min', filtros.preco_min);
    if (filtros.preco_max) params.set('preco_max', filtros.preco_max);
    params.set('orderBy', filtros.orderBy);
    params.set('page', String(p));
    params.set('limit', String(LIMIT));
    return params.toString();
  }, [filtros]);

  const fetchPage = useCallback(async (p: number, reset = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fornecedores?${buildQuery(p)}`);
      const json = await res.json();
      setFornecedores((prev) => {
        const next = reset ? json.data : [...prev, ...json.data];
        lenRef.current = next.length;
        return next;
      });
      setTotal(json.total);
      setHasMore(json.data.length === LIMIT && lenRef.current < json.total);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    setPage(1);
    fetchPage(1, true);
  }, [filtros]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        const next = page + 1;
        setPage(next);
        fetchPage(next);
      }
    }, { threshold: 0.1 });
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, page, fetchPage]);

  const handleToggleFavorito = (updated: Fornecedor) => {
    setFornecedores((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl font-bold text-[#1A1A2E]">Fornecedores</h1>
          <p className="text-sm text-[#8B7B74] mt-0.5">
            {total} fornecedor{total !== 1 ? 'es' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/fornecedor/novo"
          className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-[#C9747A] text-white rounded-xl text-sm font-semibold hover:bg-[#A85560] transition-colors"
        >
          <Plus size={16} />
          Novo Fornecedor
        </Link>
      </div>

      <FiltrosBar filtros={filtros} onChange={setFiltros} />

      {fornecedores.length === 0 && !loading ? (
        <div className="text-center py-16 text-[#8B7B74]">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium">Nenhum fornecedor encontrado</p>
          <p className="text-sm mt-1">Tente ajustar os filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {fornecedores.map((f) => (
            <FornecedorCard key={f.id} fornecedor={f} onToggleFavorito={handleToggleFavorito} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-4" />

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E8DACE] h-44 animate-pulse" />
          ))}
        </div>
      )}

      <Link
        href="/fornecedor/novo"
        className="lg:hidden fixed bottom-20 right-4 w-14 h-14 bg-[#C9747A] text-white rounded-full shadow-lg flex items-center justify-center z-20 hover:bg-[#A85560] transition-colors"
      >
        <Plus size={24} />
      </Link>
    </div>
  );
}
