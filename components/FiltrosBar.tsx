'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIAS } from '@/lib/utils';
import { useState } from 'react';

export interface Filtros {
  search: string;
  categoria: string;
  status: string;
  preco_min: string;
  preco_max: string;
  orderBy: string;
}

interface FiltrosBarProps {
  filtros: Filtros;
  onChange: (f: Filtros) => void;
}

const STATUS_CHIPS = [
  { value: '', label: 'Todos' },
  { value: 'ativo', label: 'Ativos' },
  { value: 'favorito', label: 'Favoritos' },
  { value: 'inativo', label: 'Inativos' },
];

export function FiltrosBar({ filtros, onChange }: FiltrosBarProps) {
  const [expanded, setExpanded] = useState(false);

  const set = (key: keyof Filtros, val: string) => onChange({ ...filtros, [key]: val });

  const hasActiveFilters =
    filtros.categoria || filtros.preco_min || filtros.preco_max || filtros.orderBy !== 'nome';

  return (
    <div className="space-y-3">
      {/* Search + filter toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B7B74]" />
          <input
            type="text"
            placeholder="Buscar por nome, apelido, banca ou rua..."
            value={filtros.search}
            onChange={(e) => set('search', e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E8DACE] bg-white text-sm text-[#1A1A2E] placeholder:text-[#8B7B74] focus:outline-none focus:ring-2 focus:ring-[#C9747A]/30 focus:border-[#C9747A] transition-colors"
          />
          {filtros.search && (
            <button onClick={() => set('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7B74] hover:text-[#C9747A]">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            hasActiveFilters
              ? 'bg-[#C9747A] text-white border-[#C9747A]'
              : 'bg-white text-[#8B7B74] border-[#E8DACE] hover:border-[#C9747A]'
          }`}
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">Filtros</span>
          {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
        </button>
      </div>

      {/* Status chips */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_CHIPS.map((chip) => (
          <button
            key={chip.value}
            onClick={() => set('status', chip.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              filtros.status === chip.value
                ? 'bg-[#C9747A] text-white border-[#C9747A]'
                : 'bg-white text-[#8B7B74] border-[#E8DACE] hover:border-[#C9747A] hover:text-[#C9747A]'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="bg-white rounded-2xl border border-[#E8DACE] p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-[#8B7B74] mb-1.5">Categoria</label>
              <select
                value={filtros.categoria}
                onChange={(e) => set('categoria', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DACE] bg-white text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#C9747A]/30 focus:border-[#C9747A]"
              >
                <option value="">Todas as categorias</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Price range */}
            <div>
              <label className="block text-xs font-medium text-[#8B7B74] mb-1.5">Preço mínimo (R$)</label>
              <input
                type="number"
                placeholder="0"
                value={filtros.preco_min}
                onChange={(e) => set('preco_min', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DACE] bg-white text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#C9747A]/30 focus:border-[#C9747A]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8B7B74] mb-1.5">Preço máximo (R$)</label>
              <input
                type="number"
                placeholder="999"
                value={filtros.preco_max}
                onChange={(e) => set('preco_max', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DACE] bg-white text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#C9747A]/30 focus:border-[#C9747A]"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs font-medium text-[#8B7B74] mb-1.5">Ordenar por</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'nome', label: 'Nome A–Z' },
                { value: 'nota', label: 'Melhor avaliação' },
                { value: 'preco', label: 'Menor preço' },
                { value: 'data', label: 'Mais recente' },
              ].map((o) => (
                <button
                  key={o.value}
                  onClick={() => set('orderBy', o.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    filtros.orderBy === o.value
                      ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]'
                      : 'bg-white text-[#8B7B74] border-[#E8DACE] hover:border-[#1A1A2E]'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() =>
              onChange({ search: filtros.search, categoria: '', status: filtros.status, preco_min: '', preco_max: '', orderBy: 'nome' })
            }
            className="text-xs text-[#C9747A] hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}
