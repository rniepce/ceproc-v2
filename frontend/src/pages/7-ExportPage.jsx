import { useState } from 'react';
import { useDPT, useBPMN, useKPI, useExport } from '../hooks';

/**
 * Página 7: EXPORTAÇÃO - Seleção de formatos e download
 * Permite ao usuário escolher entre DOCX, XLSX, BPMN XML ou ZIP
 * Gerencia downloads e histórico de exportações
 */
export default function ExportPage({ onNext, onPrevious }) {
  const { dpt } = useDPT();
  const { bpmn } = useBPMN();
  const { kpis } = useKPI();
  const {
    selectedFormats,
    exportHistory,
    loading,
    error,
    toggleFormat,
    selectAllFormats,
    deselectAllFormats,
    exportToDOCX,
    exportToXLSX,
    exportToBPMN,
    exportToZIP,
    getFormatInfo,
  } = useExport();

  const [exportError, setExportError] = useState('');
  const [exportSuccess, setExportSuccess] = useState('');

  const exportFormats = [
    {
      id: 'docx',
      name: 'Word Document',
      description: 'Relatório completo do processo com metadados, etapas, atores e KPIs',
      extension: '.docx',
      icon: '📄',
      color: 'from-blue-400 to-blue-600',
    },
    {
      id: 'xlsx',
      name: 'Excel Spreadsheet',
      description: 'Tabela de KPIs estruturada com 16 colunas',
      extension: '.xlsx',
      icon: '📊',
      color: 'from-green-400 to-green-600',
    },
    {
      id: 'bpmn',
      name: 'BPMN Diagram',
      description: 'Arquivo BPMN 2.0 XML com coordenadas e visualização',
      extension: '.bpmn',
      icon: '📐',
      color: 'from-purple-400 to-purple-600',
    },
  ];

  const handleExportFormat = async (format) => {
    setExportError('');
    setExportSuccess('');

    try {
      let result;
      const filename = `ceproc_${dpt?.nome_processo || 'analise'}_${new Date().toISOString().split('T')[0]}`;

      switch (format) {
        case 'docx':
          if (!dpt) throw new Error('DPT data required');
          result = await exportToDOCX(dpt, bpmn, kpis, null, `${filename}.docx`);
          break;
        case 'xlsx':
          if (!kpis || kpis.length === 0) throw new Error('KPI data required');
          result = await exportToXLSX(kpis, dpt?.nome_processo, `${filename}.xlsx`);
          break;
        case 'bpmn':
          if (!bpmn) throw new Error('BPMN data required');
          result = await exportToBPMN(bpmn, `${filename}.bpmn`);
          break;
        default:
          throw new Error('Unknown format');
      }

      setExportSuccess(`✅ Arquivo ${format.toUpperCase()} exportado com sucesso!`);
      setTimeout(() => setExportSuccess(''), 5000);
    } catch (err) {
      setExportError(`❌ Erro ao exportar ${format}: ${err.message}`);
    }
  };

  const handleExportZIP = async () => {
    setExportError('');
    setExportSuccess('');

    try {
      if (!dpt) throw new Error('DPT data required');

      const filename = `ceproc_${dpt?.nome_processo || 'analise'}_${new Date().toISOString().split('T')[0]}.zip`;
      await exportToZIP(dpt, bpmn, kpis, null, filename);

      setExportSuccess('✅ Arquivo ZIP com todos os formatos selecionados foi exportado com sucesso!');
      setTimeout(() => setExportSuccess(''), 5000);
    } catch (err) {
      setExportError(`❌ Erro ao exportar ZIP: ${err.message}`);
    }
  };

  const canExportFormat = {
    docx: !!dpt,
    xlsx: kpis && kpis.length > 0,
    bpmn: !!bpmn,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📦 EXPORTAÇÃO - Download de Resultados
          </h1>
          <p className="text-gray-600 text-lg">
            Etapa 7/8 - Exporte a análise em seu formato preferido
          </p>
        </div>

        {/* Messages */}
        {exportError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{exportError}</p>
          </div>
        )}
        {exportSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">{exportSuccess}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">❌ {error}</p>
          </div>
        )}

        {/* Format Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 Selecione os Formatos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exportFormats.map((format) => (
              <FormatCard
                key={format.id}
                format={format}
                isSelected={selectedFormats[format.id]}
                isDisabled={!canExportFormat[format.id]}
                onToggle={() => toggleFormat(format.id)}
                onExport={() => handleExportFormat(format.id)}
                isLoading={loading}
              />
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">🎯 Ações Rápidas</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={selectAllFormats}
              className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-medium hover:bg-blue-200 transition-colors"
            >
              ✓ Selecionar Todos
            </button>
            <button
              onClick={deselectAllFormats}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              ✕ Desselecionar Todos
            </button>
            <button
              onClick={handleExportZIP}
              disabled={
                !selectedFormats.docx && !selectedFormats.xlsx && !selectedFormats.bpmn || loading
              }
              className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '⏳ Exportando...' : '📦 Exportar Selecionados como ZIP'}
            </button>
          </div>
        </div>

        {/* Data Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">📊 Resumo dos Dados</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DataSummaryItem
              label="Processo"
              value={dpt?.nome_processo || '—'}
              icon="📋"
            />
            <DataSummaryItem
              label="Etapas"
              value={dpt?.etapas?.length || 0}
              icon="🔄"
            />
            <DataSummaryItem
              label="KPIs"
              value={kpis?.length || 0}
              icon="📈"
            />
            <DataSummaryItem
              label="Elementos BPMN"
              value={
                (bpmn?.activities?.length || 0) +
                (bpmn?.gateways?.length || 0) +
                (bpmn?.sequenceFlows?.length || 0)
              }
              icon="📐"
            />
          </div>
        </div>

        {/* Export History */}
        {exportHistory.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h3 className="font-bold text-lg text-gray-800 mb-4">📜 Histórico de Exportações</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {exportHistory.map((entry, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">
                      {entry.icon || '📦'} {entry.format}
                    </p>
                    <p className="text-sm text-gray-600">{entry.filename}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(entry.timestamp).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-blue-900 mb-2">💡 Dicas de Exportação</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>
              • <strong>DOCX:</strong> Ideal para relatórios executivos e compartilhamento com
              stakeholders
            </li>
            <li>
              • <strong>XLSX:</strong> Use para análise de KPIs em planilhas e tomada de decisão
            </li>
            <li>
              • <strong>BPMN:</strong> Importe em ferramentas de modelagem para visualizar o
              diagrama
            </li>
            <li>
              • <strong>ZIP:</strong> Baixe todos os formatos juntos para arquivamento completo
            </li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <button
            onClick={onPrevious}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>

          <button
            onClick={onNext}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Prosseguir →
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente: Card de Formato
 */
function FormatCard({ format, isSelected, isDisabled, onToggle, onExport, isLoading }) {
  return (
    <div
      className={`rounded-2xl shadow-xl overflow-hidden transition-all ${
        isDisabled
          ? 'opacity-50 cursor-not-allowed bg-gray-100'
          : isSelected
          ? 'ring-2 ring-blue-600 bg-white'
          : 'bg-white hover:shadow-xl'
      }`}
    >
      <div className={`bg-gradient-to-br ${format.color} p-6 text-white text-center`}>
        <p className="text-5xl mb-2">{format.icon}</p>
        <h3 className="text-xl font-bold">{format.name}</h3>
      </div>

      <div className="p-6 space-y-4">
        <p className="text-gray-600 text-sm">{format.description}</p>

        <div className="pt-4 border-t border-gray-200">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            disabled={isDisabled}
            className="mr-2"
          />
          <label className="text-sm font-medium text-gray-700">
            {format.extension}
          </label>
        </div>

        <button
          onClick={onExport}
          disabled={isDisabled || isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '⏳ Exportando...' : `Baixar ${format.extension}`}
        </button>
      </div>
    </div>
  );
}

/**
 * Componente: Item de Resumo de Dados
 */
function DataSummaryItem({ label, value, icon }) {
  return (
    <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-2xl font-bold text-blue-600">{value}</p>
    </div>
  );
}
