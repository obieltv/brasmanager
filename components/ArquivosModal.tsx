'use client';

import { useEffect, useRef, useState } from 'react';
import { X, FileText, ZoomIn, ExternalLink, Upload, Trash2, ImageIcon } from 'lucide-react';
import { Arquivo } from '@/lib/utils';
import Image from 'next/image';
import { toast } from 'sonner';

interface ArquivosModalProps {
  fornecedorId: number;
  nomeFornecedor: string;
  initialTab?: 'foto' | 'pdf';
  onClose: () => void;
  onCountChange?: (fotos: number, pdfs: number) => void;
}

export function ArquivosModal({ fornecedorId, nomeFornecedor, initialTab = 'foto', onClose, onCountChange }: ArquivosModalProps) {
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<'foto' | 'pdf'>(initialTab);
  const [lightbox, setLightbox] = useState<Arquivo | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const res = await fetch(`/api/fornecedores/${fornecedorId}/arquivos`);
      const data = await res.json();
      setArquivos(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [fornecedorId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fotos = arquivos.filter((a) => a.tipo === 'foto');
  const pdfs = arquivos.filter((a) => a.tipo === 'pdf');

  useEffect(() => {
    if (!loading) onCountChange?.(fotos.length, pdfs.length);
  }, [arquivos, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loading) {
      if (initialTab === 'foto' && fotos.length === 0 && pdfs.length > 0) setTab('pdf');
      if (initialTab === 'pdf' && pdfs.length === 0 && fotos.length > 0) setTab('foto');
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const upload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append('files', f));
      const res = await fetch(`/api/fornecedores/${fornecedorId}/arquivos`, { method: 'POST', body: form });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(`${data.total} arquivo${data.total !== 1 ? 's' : ''} enviado${data.total !== 1 ? 's' : ''}!`);
      await load();
      // auto-switch to the tab of what was uploaded
      const uploaded = data.salvos as Arquivo[];
      if (uploaded?.length) setTab(uploaded[0].tipo === 'pdf' ? 'pdf' : 'foto');
    } catch {
      toast.error('Erro ao enviar arquivo');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const deletar = async (arq: Arquivo) => {
    try {
      await fetch(`/api/arquivos/${arq.id}`, { method: 'DELETE' });
      setArquivos((prev) => prev.filter((a) => a.id !== arq.id));
      if (lightbox?.id === arq.id) setLightbox(null);
      toast.success('Arquivo excluído');
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    upload(e.dataTransfer.files);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-x-4 bottom-4 top-16 z-50 bg-white rounded-2xl shadow-2xl flex flex-col max-w-lg mx-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E8DACE]">
          <div>
            <h3 className="font-serif font-bold text-[#1A1A2E] text-base leading-tight">{nomeFornecedor}</h3>
            <p className="text-xs text-[#8B7B74]">Fotos & Documentos · {arquivos.length} item{arquivos.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#F5EFE8] text-[#8B7B74] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Upload area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`mx-4 mt-3 border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all flex items-center justify-center gap-2 ${
            dragging
              ? 'border-[#C9747A] bg-rose-50 scale-[1.01]'
              : 'border-[#E8DACE] hover:border-[#C9747A] hover:bg-rose-50/30'
          }`}
        >
          <Upload size={16} className="text-[#8B7B74] shrink-0" />
          <span className="text-xs font-medium text-[#1A1A2E]">
            {uploading ? 'Enviando...' : 'Arraste ou clique para adicionar fotos e PDFs'}
          </span>
        </div>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => upload(e.target.files)}
          disabled={uploading}
        />

        {/* Tabs */}
        <div className="flex border-b border-[#E8DACE] mt-3">
          {[
            { key: 'foto' as const, label: `📷 Fotos (${fotos.length})` },
            { key: 'pdf' as const, label: `📄 PDFs (${pdfs.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                tab === t.key
                  ? 'border-[#C9747A] text-[#C9747A]'
                  : 'border-transparent text-[#8B7B74] hover:text-[#1A1A2E]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="grid grid-cols-2 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-[#F5EFE8] rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {!loading && tab === 'foto' && (
            fotos.length === 0 ? (
              <div className="text-center py-10 text-[#8B7B74]">
                <ImageIcon size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhuma foto ainda</p>
                <p className="text-xs mt-1">Clique na área acima para adicionar</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {fotos.map((arq) => (
                  <div key={arq.id} className="relative aspect-square rounded-xl overflow-hidden border border-[#E8DACE] bg-[#F5EFE8] group">
                    <Image
                      src={arq.caminho}
                      alt={arq.nome}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 640px) 45vw, 200px"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2">
                      <button
                        onClick={() => setLightbox(arq)}
                        className="p-1.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                      >
                        <ZoomIn size={14} className="text-[#1A1A2E]" />
                      </button>
                      <button
                        onClick={() => deletar(arq)}
                        className="p-1.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                      >
                        <Trash2 size={14} className="text-[#C96B6B]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {!loading && tab === 'pdf' && (
            pdfs.length === 0 ? (
              <div className="text-center py-10 text-[#8B7B74]">
                <FileText size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum PDF ainda</p>
                <p className="text-xs mt-1">Clique na área acima para adicionar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pdfs.map((arq) => (
                  <div key={arq.id} className="flex items-center gap-3 p-3 bg-[#F5EFE8] rounded-xl group">
                    <div className="p-2.5 bg-red-100 rounded-xl shrink-0">
                      <FileText size={20} className="text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A2E] truncate">{arq.nome}</p>
                      <p className="text-xs text-[#8B7B74]">Toque para abrir</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={arq.caminho}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-[#8B7B74] hover:text-[#C9747A] transition-colors"
                      >
                        <ExternalLink size={15} />
                      </a>
                      <button
                        onClick={() => deletar(arq)}
                        className="p-1.5 rounded-lg text-[#8B7B74] hover:text-[#C96B6B] transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 p-2 text-white/70 hover:text-white">
            <X size={24} />
          </button>
          <div className="relative max-w-2xl w-full" style={{ paddingBottom: '75%' }} onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightbox.caminho}
              alt={lightbox.nome}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); deletar(lightbox); }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-2 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 size={13} /> Excluir foto
          </button>
        </div>
      )}
    </>
  );
}
