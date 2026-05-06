'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2, Save, X, Plus } from 'lucide-react';
import { Fornecedor, CATEGORIAS, FORMAS_PAGAMENTO, aplicarMascaraTelefone, cn } from '@/lib/utils';
import { StarRating } from './StarRating';

const SEP = '||';

type FormData = Omit<Fornecedor, 'id' | 'criado_em' | 'atualizado_em'>;

interface FornecedorFormProps {
  initial?: Fornecedor;
  mode: 'create' | 'edit';
}

function splitMulti(val: string | null | undefined): string[] {
  if (!val) return [''];
  const parts = val.split(SEP).map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : [''];
}

function joinMulti(arr: string[]): string {
  return arr.map((s) => s.trim()).filter(Boolean).join(SEP);
}

export function FornecedorForm({ initial, mode }: FornecedorFormProps) {
  const router = useRouter();

  // Multi-value states
  const [whatsapps, setWhatsapps] = useState<string[]>(splitMulti(initial?.whatsapp));
  const [instagrams, setInstagrams] = useState<string[]>(splitMulti(initial?.instagram));
  const [locations, setLocations] = useState<{ banca: string; rua: string }[]>(() => {
    const bancas = splitMulti(initial?.banca);
    const ruas = splitMulti(initial?.rua);
    const len = Math.max(bancas.length, ruas.length, 1);
    return Array.from({ length: len }, (_, i) => ({
      banca: bancas[i] ?? '',
      rua: ruas[i] ?? '',
    }));
  });

  const [form, setForm] = useState<Omit<FormData, 'whatsapp' | 'instagram' | 'banca' | 'rua'>>({
    nome: initial?.nome ?? '',
    apelido: initial?.apelido ?? '',
    categoria: initial?.categoria ?? '',
    categoria_custom: initial?.categoria_custom ?? '',
    sub_categoria: initial?.sub_categoria ?? '',
    tipo_venda: initial?.tipo_venda ?? 'atacado',
    preco_min: initial?.preco_min ?? null,
    preco_max: initial?.preco_max ?? null,
    pedido_minimo: initial?.pedido_minimo ?? null,
    preco_varejo_min: initial?.preco_varejo_min ?? null,
    preco_varejo_max: initial?.preco_varejo_max ?? null,
    pedido_minimo_varejo: initial?.pedido_minimo_varejo ?? null,
    pagamento: initial?.pagamento ?? '',
    nota: initial?.nota ?? 0,
    status: initial?.status ?? 'ativo',
    observacoes: initial?.observacoes ?? '',
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const pagamentos = form.pagamento ? form.pagamento.split(', ').filter(Boolean) : [];

  const togglePagamento = (p: string) => {
    const set = new Set(pagamentos);
    set.has(p) ? set.delete(p) : set.add(p);
    setForm((prev) => ({ ...prev, pagamento: Array.from(set).join(', ') }));
  };

  const setField = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  // WhatsApp helpers
  const setWpp = (i: number, val: string) =>
    setWhatsapps((prev) => prev.map((v, idx) => (idx === i ? val : v)));
  const addWpp = () => setWhatsapps((prev) => [...prev, '']);
  const removeWpp = (i: number) =>
    setWhatsapps((prev) => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : ['']);

  // Instagram helpers
  const setIg = (i: number, val: string) =>
    setInstagrams((prev) => prev.map((v, idx) => (idx === i ? val : v)));
  const addIg = () => setInstagrams((prev) => [...prev, '']);
  const removeIg = (i: number) =>
    setInstagrams((prev) => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : ['']);

  // Location helpers
  const setLoc = (i: number, field: 'banca' | 'rua', val: string) =>
    setLocations((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: val } : l)));
  const addLoc = () => setLocations((prev) => [...prev, { banca: '', rua: '' }]);
  const removeLoc = (i: number) =>
    setLocations((prev) => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : [{ banca: '', rua: '' }]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) { toast.error('Nome é obrigatório'); return; }

    // Resolve categoria personalizada
    const categoriaFinal =
      form.categoria === '__custom__'
        ? (form.categoria_custom?.trim() || '')
        : form.categoria;

    if (!categoriaFinal) {
      toast.error(form.categoria === '__custom__' ? 'Digite o nome da nova categoria' : 'Categoria é obrigatória');
      return;
    }

    const payload: FormData = {
      ...form,
      categoria: categoriaFinal,
      whatsapp: joinMulti(whatsapps) || null,
      instagram: joinMulti(instagrams) || null,
      banca: joinMulti(locations.map((l) => l.banca)) || null,
      rua: joinMulti(locations.map((l) => l.rua)) || null,
    };

    setSaving(true);
    try {
      const url = mode === 'edit' ? `/api/fornecedores/${initial!.id}` : '/api/fornecedores';
      const method = mode === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao salvar');
      }
      const saved = await res.json();
      toast.success(mode === 'edit' ? 'Fornecedor atualizado!' : 'Fornecedor cadastrado!');
      router.push(`/fornecedor/${saved.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await fetch(`/api/fornecedores/${initial!.id}`, { method: 'DELETE' });
      toast.success('Fornecedor excluído');
      router.push('/');
    } catch {
      toast.error('Erro ao excluir');
    } finally {
      setDeleting(false);
    }
  };

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-[#E8DACE] bg-white text-sm text-[#1A1A2E] placeholder:text-[#8B7B74]/60 focus:outline-none focus:ring-2 focus:ring-[#C9747A]/30 focus:border-[#C9747A] transition-colors';
  const labelCls = 'block text-xs font-semibold text-[#8B7B74] uppercase tracking-wide mb-1.5';
  const sectionCls = 'bg-white rounded-2xl border border-[#E8DACE] p-5 space-y-4';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-28 lg:pb-8">

      {/* Identificação */}
      <div className={sectionCls}>
        <h2 className="font-serif text-base font-semibold text-[#1A1A2E]">Identificação</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nome completo <span className="text-[#C9747A]">*</span></label>
            <input
              className={inputCls}
              placeholder="Ex: Modas Bella"
              value={form.nome}
              onChange={(e) => setField('nome', e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Apelido / nome comercial</label>
            <input
              className={inputCls}
              placeholder="Ex: Bella"
              value={form.apelido ?? ''}
              onChange={(e) => setField('apelido', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Contato — WhatsApp */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-base font-semibold text-[#1A1A2E]">WhatsApp</h2>
          <button
            type="button"
            onClick={addWpp}
            className="flex items-center gap-1 text-xs font-medium text-[#C9747A] hover:text-[#A85560] transition-colors"
          >
            <Plus size={14} />
            Adicionar número
          </button>
        </div>
        <div className="space-y-2">
          {whatsapps.map((wpp, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                className={cn(inputCls, 'flex-1')}
                placeholder="(11) 99999-9999"
                value={wpp}
                onChange={(e) => setWpp(i, aplicarMascaraTelefone(e.target.value))}
                inputMode="tel"
              />
              {whatsapps.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeWpp(i)}
                  className="p-2 rounded-xl text-[#8B7B74] hover:text-[#C96B6B] hover:bg-red-50 transition-colors shrink-0"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contato — Instagram */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-base font-semibold text-[#1A1A2E]">Instagram</h2>
          <button
            type="button"
            onClick={addIg}
            className="flex items-center gap-1 text-xs font-medium text-[#C9747A] hover:text-[#A85560] transition-colors"
          >
            <Plus size={14} />
            Adicionar perfil
          </button>
        </div>
        <div className="space-y-2">
          {instagrams.map((ig, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                className={cn(inputCls, 'flex-1')}
                placeholder="@usuario ou URL"
                value={ig}
                onChange={(e) => setIg(i, e.target.value)}
              />
              {instagrams.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIg(i)}
                  className="p-2 rounded-xl text-[#8B7B74] hover:text-[#C96B6B] hover:bg-red-50 transition-colors shrink-0"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Localização */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-base font-semibold text-[#1A1A2E]">Localização no Brás</h2>
          <button
            type="button"
            onClick={addLoc}
            className="flex items-center gap-1 text-xs font-medium text-[#C9747A] hover:text-[#A85560] transition-colors"
          >
            <Plus size={14} />
            Adicionar local
          </button>
        </div>
        <div className="space-y-3">
          {locations.map((loc, i) => (
            <div key={i} className={cn(
              'space-y-2',
              locations.length > 1 && 'bg-[#FDF8F4] rounded-xl p-3 border border-[#E8DACE]'
            )}>
              {locations.length > 1 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#8B7B74] uppercase tracking-wide">Local {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeLoc(i)}
                    className="p-1 rounded-lg text-[#8B7B74] hover:text-[#C96B6B] hover:bg-red-50 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  {i === 0 && locations.length === 1 && (
                    <label className={labelCls}>Número / nome da banca ou loja</label>
                  )}
                  <input
                    className={inputCls}
                    placeholder="Ex: 47 ou Loja 12A"
                    value={loc.banca}
                    onChange={(e) => setLoc(i, 'banca', e.target.value)}
                  />
                </div>
                <div>
                  {i === 0 && locations.length === 1 && (
                    <label className={labelCls}>Rua ou galeria</label>
                  )}
                  <input
                    className={inputCls}
                    placeholder="Ex: Galeria Cristal, Rua Oriente"
                    value={loc.rua}
                    onChange={(e) => setLoc(i, 'rua', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Produto */}
      <div className={sectionCls}>
        <h2 className="font-serif text-base font-semibold text-[#1A1A2E]">Produto</h2>

        {/* Categoria */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Categoria <span className="text-[#C9747A]">*</span></label>
            <select
              className={inputCls}
              value={form.categoria}
              onChange={(e) => {
                setField('categoria', e.target.value);
                if (e.target.value !== '__custom__') setField('categoria_custom', '');
              }}
            >
              <option value="">Selecione a categoria</option>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              <option value="__custom__">＋ Criar nova categoria...</option>
            </select>
            {form.categoria === '__custom__' && (
              <input
                className={cn(inputCls, 'mt-2')}
                placeholder="Nome da nova categoria"
                value={form.categoria_custom ?? ''}
                onChange={(e) => setField('categoria_custom', e.target.value)}
                autoFocus
              />
            )}
          </div>
          <div>
            <label className={labelCls}>Sub-categoria</label>
            <input
              className={inputCls}
              placeholder="Ex: Vestidos florais, Plus size..."
              value={form.sub_categoria ?? ''}
              onChange={(e) => setField('sub_categoria', e.target.value)}
            />
          </div>
        </div>

        {/* Tipo de venda */}
        <div>
          <label className={labelCls}>Tipo de venda</label>
          <div className="flex gap-2">
            {[
              { value: 'atacado', label: '📦 Atacado' },
              { value: 'varejo', label: '🛍️ Varejo' },
              { value: 'ambos', label: '📦🛍️ Atacado + Varejo' },
            ].map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setField('tipo_venda', t.value as typeof form.tipo_venda)}
                className={cn(
                  'flex-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors',
                  form.tipo_venda === t.value
                    ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]'
                    : 'bg-white text-[#8B7B74] border-[#E8DACE] hover:border-[#1A1A2E]'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preços Atacado */}
        {(form.tipo_venda === 'atacado' || form.tipo_venda === 'ambos') && (
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 space-y-3">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">📦 Preços no Atacado</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Preço mín. (R$)</label>
                <input
                  type="number" min="0" step="0.01"
                  className={inputCls}
                  placeholder="0,00"
                  value={form.preco_min ?? ''}
                  onChange={(e) => setField('preco_min', e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
              <div>
                <label className={labelCls}>Preço máx. (R$)</label>
                <input
                  type="number" min="0" step="0.01"
                  className={inputCls}
                  placeholder="0,00"
                  value={form.preco_max ?? ''}
                  onChange={(e) => setField('preco_max', e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
              <div>
                <label className={labelCls}>Qtd. mínima</label>
                <input
                  type="number" min="1"
                  className={inputCls}
                  placeholder="12"
                  value={form.pedido_minimo ?? ''}
                  onChange={(e) => setField('pedido_minimo', e.target.value ? parseInt(e.target.value) : null)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Preços Varejo */}
        {(form.tipo_venda === 'varejo' || form.tipo_venda === 'ambos') && (
          <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 space-y-3">
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide">🛍️ Preços no Varejo</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Preço mín. (R$)</label>
                <input
                  type="number" min="0" step="0.01"
                  className={inputCls}
                  placeholder="0,00"
                  value={form.preco_varejo_min ?? ''}
                  onChange={(e) => setField('preco_varejo_min', e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
              <div>
                <label className={labelCls}>Preço máx. (R$)</label>
                <input
                  type="number" min="0" step="0.01"
                  className={inputCls}
                  placeholder="0,00"
                  value={form.preco_varejo_max ?? ''}
                  onChange={(e) => setField('preco_varejo_max', e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
              <div>
                <label className={labelCls}>Qtd. mínima</label>
                <input
                  type="number" min="1"
                  className={inputCls}
                  placeholder="1"
                  value={form.pedido_minimo_varejo ?? ''}
                  onChange={(e) => setField('pedido_minimo_varejo', e.target.value ? parseInt(e.target.value) : null)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Pagamento */}
        <div>
          <label className={labelCls}>Formas de pagamento aceitas</label>
          <div className="flex flex-wrap gap-2">
            {FORMAS_PAGAMENTO.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => togglePagamento(p)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  pagamentos.includes(p)
                    ? 'bg-[#C9747A] text-white border-[#C9747A]'
                    : 'bg-white text-[#8B7B74] border-[#E8DACE] hover:border-[#C9747A]'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Avaliação */}
      <div className={sectionCls}>
        <h2 className="font-serif text-base font-semibold text-[#1A1A2E]">Avaliação</h2>

        <div>
          <label className={labelCls}>Nota</label>
          <StarRating value={form.nota} onChange={(v) => setField('nota', v)} size="lg" />
        </div>

        <div>
          <label className={labelCls}>Status</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'ativo', label: 'Ativo' },
              { value: 'favorito', label: '❤ Favorito' },
              { value: 'inativo', label: 'Inativo' },
            ].map((s) => (
              <label key={s.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={s.value}
                  checked={form.status === s.value}
                  onChange={() => setField('status', s.value as typeof form.status)}
                  className="accent-[#C9747A]"
                />
                <span className={cn(
                  'text-sm font-medium',
                  form.status === s.value ? 'text-[#C9747A]' : 'text-[#8B7B74]'
                )}>{s.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>Observações</label>
          <textarea
            className={cn(inputCls, 'resize-none')}
            rows={3}
            placeholder="Anotações livres sobre o fornecedor..."
            value={form.observacoes ?? ''}
            onChange={(e) => setField('observacoes', e.target.value)}
          />
        </div>
      </div>

      {/* Actions — fixed on mobile */}
      <div className="fixed bottom-16 lg:bottom-auto left-0 right-0 lg:relative bg-[#FDF8F4]/95 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none border-t border-[#E8DACE] lg:border-0 p-4 lg:p-0 z-20">
        <div className="flex gap-3 max-w-2xl lg:max-w-none mx-auto">
          {mode === 'edit' && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors',
                confirmDelete
                  ? 'bg-[#C96B6B] text-white border-[#C96B6B]'
                  : 'bg-white text-[#C96B6B] border-[#C96B6B] hover:bg-[#C96B6B] hover:text-white'
              )}
            >
              <Trash2 size={15} />
              {confirmDelete ? 'Confirmar exclusão' : 'Excluir'}
            </button>
          )}
          {confirmDelete && (
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-white text-[#8B7B74] border border-[#E8DACE]"
            >
              <X size={15} />
              Cancelar
            </button>
          )}
          {!confirmDelete && (
            <>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-white text-[#8B7B74] border border-[#E8DACE] hover:border-[#C9747A]"
              >
                <X size={15} />
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#C9747A] text-white hover:bg-[#A85560] transition-colors disabled:opacity-60"
              >
                <Save size={15} />
                {saving ? 'Salvando...' : 'Salvar fornecedor'}
              </button>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
