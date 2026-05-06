'use client';

import { useRef, useState } from 'react';
import { Download, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';

export default function ImportarExportarPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ inserted: number; skipped: number } | null>(null);

  const handleExport = () => {
    const link = document.createElement('a');
    link.href = '/api/exportar';
    link.download = `fornecedores-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success('Exportação iniciada!');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const { data } = Papa.parse(text, { header: true, delimiter: ';', skipEmptyLines: true });

      const res = await fetch('/api/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fornecedores: data }),
      });

      if (!res.ok) throw new Error('Erro ao importar');
      const result = await res.json();
      setImportResult(result);
      toast.success(`${result.inserted} fornecedor${result.inserted !== 1 ? 'es' : ''} importado${result.inserted !== 1 ? 's' : ''}!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao importar');
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        'Nome': 'Modas Bella',
        'Apelido': 'Bella',
        'WhatsApp': '(11) 91234-5678',
        'Instagram': '@modasbella',
        'Banca': '47',
        'Rua/Galeria': 'Galeria Cristal',
        'Categoria': 'Vestidos',
        'Sub-categoria': 'Vestidos florais',
        'Preço Mínimo': '25',
        'Preço Máximo': '80',
        'Pedido Mínimo': '12',
        'Pagamento': 'PIX, Dinheiro',
        'Nota': '5',
        'Status': 'ativo',
        'Observações': 'Ótimo atendimento',
      },
    ];

    const csv = Papa.unparse(template, { delimiter: ';' });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template-fornecedores.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Template baixado!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-bold text-[#1A1A2E]">Importar / Exportar</h1>
        <p className="text-sm text-[#8B7B74] mt-0.5">Gerencie seus dados em CSV</p>
      </div>

      {/* Export */}
      <div className="bg-white rounded-2xl border border-[#E8DACE] p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-50 rounded-xl">
            <Download size={20} className="text-[#7FA98D]" />
          </div>
          <div>
            <h2 className="font-serif text-base font-semibold text-[#1A1A2E]">Exportar Fornecedores</h2>
            <p className="text-xs text-[#8B7B74]">Baixe todos os fornecedores em formato CSV</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#7FA98D] text-white rounded-xl font-semibold text-sm hover:bg-[#6a9278] transition-colors"
        >
          <Download size={16} />
          Exportar CSV
        </button>
      </div>

      {/* Import */}
      <div className="bg-white rounded-2xl border border-[#E8DACE] p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 rounded-xl">
            <Upload size={20} className="text-[#C9747A]" />
          </div>
          <div>
            <h2 className="font-serif text-base font-semibold text-[#1A1A2E]">Importar Fornecedores</h2>
            <p className="text-xs text-[#8B7B74]">Carregue um arquivo CSV com fornecedores</p>
          </div>
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-[#E8DACE] rounded-xl p-8 text-center cursor-pointer hover:border-[#C9747A] hover:bg-rose-50/30 transition-colors"
        >
          <FileText size={32} className="mx-auto text-[#8B7B74] mb-2" />
          <p className="text-sm font-medium text-[#1A1A2E]">
            {importing ? 'Importando...' : 'Clique para selecionar o arquivo CSV'}
          </p>
          <p className="text-xs text-[#8B7B74] mt-1">Apenas arquivos .csv com delimitador ;</p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleImport}
          disabled={importing}
        />

        {importResult && (
          <div className="rounded-xl bg-[#F5EFE8] p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#7FA98D]">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">{importResult.inserted} fornecedor{importResult.inserted !== 1 ? 'es' : ''} importado{importResult.inserted !== 1 ? 's' : ''}</span>
            </div>
            {importResult.skipped > 0 && (
              <div className="flex items-center gap-2 text-[#E8B86D]">
                <AlertCircle size={16} />
                <span className="text-sm">{importResult.skipped} registro{importResult.skipped !== 1 ? 's' : ''} ignorado{importResult.skipped !== 1 ? 's' : ''} (WhatsApp duplicado)</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Template */}
      <div className="bg-[#F5EFE8] rounded-2xl border border-[#E8DACE] p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-xl">
            <FileText size={20} className="text-[#D4A373]" />
          </div>
          <div>
            <h2 className="font-serif text-base font-semibold text-[#1A1A2E]">Template de Importação</h2>
            <p className="text-xs text-[#8B7B74]">Baixe um arquivo de exemplo para usar como base</p>
          </div>
        </div>

        <div className="text-xs text-[#8B7B74] space-y-1">
          <p><span className="font-medium text-[#1A1A2E]">Colunas obrigatórias:</span> Nome, Categoria</p>
          <p><span className="font-medium text-[#1A1A2E]">Delimitador:</span> ponto e vírgula (;)</p>
          <p><span className="font-medium text-[#1A1A2E]">Duplicatas:</span> ignoradas por WhatsApp</p>
          <p><span className="font-medium text-[#1A1A2E]">Encoding:</span> UTF-8</p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-[#1A1A2E] border border-[#E8DACE] rounded-xl text-sm font-medium hover:border-[#C9747A] hover:text-[#C9747A] transition-colors"
        >
          <Download size={15} />
          Baixar template CSV
        </button>
      </div>
    </div>
  );
}
