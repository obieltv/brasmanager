'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, FileText, ImageIcon, X, ZoomIn } from 'lucide-react';
import { toast } from 'sonner';
import { Arquivo } from '@/lib/utils';
import Image from 'next/image';

interface ArquivosSectionProps {
  fornecedorId: number;
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ArquivosSection({ fornecedorId }: ArquivosSectionProps) {
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<Arquivo | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fotos = arquivos.filter((a) => a.tipo === 'foto');
  const pdfs = arquivos.filter((a) => a.tipo === 'pdf');

  const load = async () => {
    try {
      const res = await fetch(`/api/fornecedores/${fornecedorId}/arquivos`);
      const data = await res.json();
      setArquivos(data);
    } catch {
      toast.error('Erro ao carregar arquivos');
    }
  };

  useEffect(() => { load(); }, [fornecedorId]); // eslint-disable-line react-hooks/exhaustive-deps

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
      toast.success('Arquivo excluído');
      if (lightbox?.id === arq.id) setLightbox(null);
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
    <div className="space-y-4">
      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          dragging
            ? 'border-[#C9747A] bg-rose-50 scale-[1.01]'
            : 'border-[#E8DACE] hover:border-[#C9747A] hover:bg-rose-50/30'
        }`}
      >
        <Upload size={28} className="mx-auto text-[#8B7B74] mb-2" />
        <p className="text-sm font-medium text-[#1A1A2E]">
          {uploading ? 'Enviando...' : 'Arraste ou clique para enviar'}
        </p>
        <p className="text-xs text-[#8B7B74] mt-1">Fotos (JPG, PNG, WEBP) e PDFs · até 20 MB por arquivo</p>
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

      {/* Fotos */}
      {fotos.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#8B7B74] uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <ImageIcon size={13} /> Fotos ({fotos.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {fotos.map((arq) => (
              <div key={arq.id} className="group relative rounded-xl overflow-hidden border border-[#E8DACE] aspect-square bg-[#F5EFE8]">
                <Image
                  src={arq.caminho}
                  alt={arq.nome}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 200px"
                />
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setLightbox(arq); }}
                    className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    <ZoomIn size={15} className="text-[#1A1A2E]" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deletar(arq); }}
                    className="p-2 bg-white/90 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={15} className="text-[#C96B6B]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDFs */}
      {pdfs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#8B7B74] uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <FileText size={13} /> PDFs ({pdfs.length})
          </p>
          <div className="space-y-2">
            {pdfs.map((arq) => (
              <div key={arq.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#E8DACE] group">
                <div className="p-2 bg-red-50 rounded-lg shrink-0">
                  <FileText size={18} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A2E] truncate">{arq.nome}</p>
                  {arq.tamanho && <p className="text-xs text-[#8B7B74]">{formatBytes(arq.tamanho)}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <a
                    href={arq.caminho}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-medium bg-[#F5EFE8] text-[#1A1A2E] rounded-lg hover:bg-[#C9747A] hover:text-white transition-colors"
                  >
                    Abrir
                  </a>
                  <button
                    onClick={() => deletar(arq)}
                    className="p-1.5 rounded-lg text-[#8B7B74] hover:text-[#C96B6B] hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {arquivos.length === 0 && !uploading && (
        <p className="text-center text-xs text-[#8B7B74] py-2">Nenhum arquivo ainda</p>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 p-2 text-white/70 hover:text-white"
            >
              <X size={24} />
            </button>
            <div className="relative w-full" style={{ paddingBottom: '75%' }}>
              <Image
                src={lightbox.caminho}
                alt={lightbox.nome}
                fill
                className="object-contain rounded-xl"
                sizes="90vw"
              />
            </div>
            <p className="text-white/60 text-xs text-center mt-3">{lightbox.nome}</p>
            <button
              onClick={() => deletar(lightbox)}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 size={13} /> Excluir foto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
