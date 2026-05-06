'use client';

import { useEffect, useState } from 'react';
import { Users, Heart, TrendingUp, Tag } from 'lucide-react';
import { formatarPreco, CATEGORIA_CORES, cn } from '@/lib/utils';

interface Stats {
  total: number;
  favoritos: number;
  ativos: number;
  inativos: number;
  media_preco: number | null;
  por_categoria: { categoria: string; count: number }[];
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/fornecedores/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E8DACE] p-4 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Total de Fornecedores',
      value: stats.total,
      icon: Users,
      color: 'text-[#C9747A]',
      bg: 'bg-rose-50',
    },
    {
      label: 'Favoritos',
      value: stats.favoritos,
      icon: Heart,
      color: 'text-[#C9747A]',
      bg: 'bg-rose-50',
    },
    {
      label: 'Preço Médio/Peça',
      value: stats.media_preco ? formatarPreco(stats.media_preco) : '—',
      icon: TrendingUp,
      color: 'text-[#7FA98D]',
      bg: 'bg-green-50',
    },
    {
      label: 'Categorias',
      value: stats.por_categoria.length,
      icon: Tag,
      color: 'text-[#D4A373]',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-[#E8DACE] shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn('p-2 rounded-xl', c.bg)}>
                <c.icon size={16} className={c.color} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#1A1A2E]">{c.value}</div>
            <div className="text-xs text-[#8B7B74] mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Top categories */}
      {stats.por_categoria.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E8DACE] shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4">
          <h3 className="text-xs font-semibold text-[#8B7B74] uppercase tracking-wider mb-3">Top Categorias</h3>
          <div className="flex flex-wrap gap-2">
            {stats.por_categoria.slice(0, 5).map((cat) => (
              <div key={cat.categoria} className="flex items-center gap-1.5">
                <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', CATEGORIA_CORES[cat.categoria] || 'bg-gray-100 text-gray-700')}>
                  {cat.categoria} <span className="opacity-70">({cat.count})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
