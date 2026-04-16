import { useState, useEffect } from 'react';
import { useAPI } from '../hooks';

/**
 * Página 5: GARGALOS - Análise de bottlenecks e oportunidades de melhoria
 * Exibe gargalos identificados no processo e sugestões de melhoria
 * Permite filtros por severidade e análise de impacto
 *
 * Receives `workflow` prop from App.jsx for shared state access.
 */
export default function GargalosPage({ onNext, onPrevious, workflow }) {
  const dpt = workflow?.dpt ?? null;
  const bpmn = workflow?.bpmn ?? null;
  const gargalosAPI = useAPI('/api/gargalos', 'POST');

  const [gargalos, setGargalos] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [expandedGargalo, setExpandedGargalo] = useState(null);
  const [analysisError, setAnalysisError] = useState('');

  // Generate bottleneck analysis on mount
  useEffect(() => {
    if (dpt && bpmn && !gargalos) {
      handleAnalyzeBotltecks();
    } else if (dpt && !bpmn && !gargalos) {
      handleQuickAnalysis();
    }
  }, [dpt, bpmn, gargalos]);

  const handleAnalyzeBotltecks = async () => {
    setAnalysisError('');
    try {
      const payload = {
        dpt,
        bpmn: bpmn || {},
        severity_threshold: severityFilter === 'all' ? 'all' : severityFilter,
      };
      const result = await gargalosAPI.execute(payload);
      setGargalos(result);
    } catch (err) {
      setAnalysisError(err.message || 'Erro ao analisar gargalos');
    }
  };

  const handleQuickAnalysis = async () => {
    setAnalysisError('');
    try {
      // Quick analysis: use the main gargalos endpoint with just the DPT
      const result = await gargalosAPI.execute({ dpt, bpmn: {}, severity_threshold: 'all' });
      setGargalos(result);
    } catch (err) {
      setAnalysisError(err.message || 'Erro ao analisar gargalos');
    }
  };

  const getFilteredBottlenecks = () => {
    if (!gargalos?.bottlenecks) return [];
    if (severityFilter === 'all') return gargalos.bottlenecks;
    return gargalos.bottlenecks.filter((b) => b.severity === severityFilter);
  };

  const filteredBottlenecks = getFilteredBottlenecks();

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      high: { text: '🔴 Alta', bg: 'bg-red-500' },
      medium: { text: '🟡 Média', bg: 'bg-yellow-500' },
      low: { text: '🔵 Baixa', bg: 'bg-blue-500' },
    };
    return badges[severity] || { text: '⚪ Desconhecida', bg: 'bg-gray-500' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎯 GARGALOS - Análise de Bottlenecks
          </h1>
          <p className="text-gray-600 text-lg">
            Etapa 5/8 - Identifique gargalos e oportunidades de melhoria
          </p>
        </div>

        {/* Error Messages */}
        {analysisError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">❌ {analysisError}</p>
          </div>
        )}

        {/* Loading State */}
        {gargalosAPI.loading && !gargalos && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <p className="text-xl text-gray-600 mb-4">⏳ Analisando gargalos...</p>
            <div className="inline-block animate-spin text-4xl">⚙️</div>
          </div>
        )}

        {gargalos && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <SummaryCard
                label="Total de Gargalos"
                value={gargalos.summary?.total_bottlenecks || 0}
                icon="🎯"
                color="bg-blue-50 border-blue-200"
              />
              <SummaryCard
                label="Alta Severidade"
                value={gargalos.summary?.high_severity || 0}
                icon="🔴"
                color="bg-red-50 border-red-200"
              />
              <SummaryCard
                label="Melhorias Propostas"
                value={gargalos.summary?.total_improvements || 0}
                icon="💡"
                color="bg-green-50 border-green-200"
              />
              <SummaryCard
                label="Impacto Potencial"
                value={Math.min(gargalos.summary?.total_improvements || 0, 99)}
                icon="📈"
                color="bg-purple-50 border-purple-200"
              />
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4">🔍 Filtro de Severidade</h3>
              <div className="flex flex-wrap gap-3">
                {['all', 'high', 'medium', 'low'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSeverityFilter(level)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      severityFilter === level
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level === 'all'
                      ? 'Todos'
                      : level === 'high'
                      ? '🔴 Alta'
                      : level === 'medium'
                      ? '🟡 Média'
                      : '🔵 Baixa'}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottlenecks Section */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                🔴 Gargalos Identificados ({filteredBottlenecks.length})
              </h2>
              <div className="space-y-3">
                {filteredBottlenecks.length > 0 ? (
                  filteredBottlenecks.map((gargalo, idx) => (
                    <BottleneckCard
                      key={idx}
                      gargalo={gargalo}
                      isExpanded={expandedGargalo === idx}
                      onToggle={() =>
                        setExpandedGargalo(expandedGargalo === idx ? null : idx)
                      }
                      getSeverityColor={getSeverityColor}
                      getSeverityBadge={getSeverityBadge}
                    />
                  ))
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                    <p className="text-green-800 text-lg">
                      ✅ Nenhum gargalo com essa severidade encontrado!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Improvements Section */}
            {gargalos.improvements && gargalos.improvements.length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  💡 Oportunidades de Melhoria ({gargalos.improvements.length})
                </h2>
                <div className="space-y-3">
                  {gargalos.improvements.map((improvement, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-gray-800">
                          {improvement.improvement}
                        </h3>
                        <div className="flex gap-2">
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                            Esforço: {improvement.effort}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{improvement.expected_benefit}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-600">
                          📊 <strong>Benefício Esperado:</strong> {improvement.expected_benefit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <p className="text-blue-800">
                💡 <strong>Dica:</strong> Os gargalos foram identificados com base na estrutura do
                processo (DPT)
                {bpmn && ' e no diagrama BPMN gerado'}. Revise as recomendações e considere as
                oportunidades de melhoria na próxima etapa.
              </p>
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between gap-4">
          <button
            onClick={onPrevious}
            disabled={gargalosAPI.loading}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>

          <button
            onClick={onNext}
            disabled={gargalosAPI.loading || !gargalos}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {gargalosAPI.loading ? 'Processando...' : 'Prosseguir →'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente de cartão de resumo
 */
function SummaryCard({ label, value, icon, color }) {
  return (
    <div className={`rounded-2xl shadow-xl p-6 border ${color}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

/**
 * Componente de cartão de gargalo
 */
function BottleneckCard({
  gargalo,
  isExpanded,
  onToggle,
  getSeverityColor,
  getSeverityBadge,
}) {
  const severity = getSeverityBadge(gargalo.severity);

  return (
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden border-l-4 ${
      gargalo.severity === 'high'
        ? 'border-red-500'
        : gargalo.severity === 'medium'
        ? 'border-yellow-500'
        : 'border-blue-500'
    }`}>
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 text-left">
          <span className={`px-3 py-1 rounded-full text-sm font-bold text-white ${severity.bg}`}>
            {severity.text}
          </span>
          <div>
            <h3 className="font-bold text-lg text-gray-800">{gargalo.activity}</h3>
            <p className="text-sm text-gray-600">{gargalo.description}</p>
          </div>
        </div>
        <span className={`text-2xl transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Impacto</h4>
            <p className="text-gray-600">{gargalo.impact}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Recomendação</h4>
            <p className="text-gray-600">{gargalo.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
