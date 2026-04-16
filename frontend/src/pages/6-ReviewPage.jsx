import { useState } from 'react';

/**
 * Página 6: REVISÃO - Revisão completa de todos os dados coletados
 * Exibe abas para DPT, BPMN, e KPI com opções para edição
 * Resumo executivo do processo analisado
 *
 * Receives `workflow` prop from App.jsx for shared state access.
 */
export default function ReviewPage({ onNext, onPrevious, workflow }) {
  const dpt = workflow?.dpt ?? null;
  const metadata = workflow?.entrada?.metadata ?? {};
  const bpmn = workflow?.bpmn ?? null;
  const kpis = workflow?.kpis ?? [];
  const kpiSummary = null;

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📋 REVISÃO - Resumo da Análise
          </h1>
          <p className="text-gray-600 text-lg">
            Etapa 6/8 - Revise todos os dados coletados antes de exportar
          </p>
        </div>

        {/* Overview Card */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-3xl font-bold mb-4">{dpt?.nome_processo || 'Processo Analisado'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="opacity-80 mb-1">Analista</p>
              <p className="text-xl font-semibold">{metadata.analista || '—'}</p>
            </div>
            <div>
              <p className="opacity-80 mb-1">Departamento</p>
              <p className="text-xl font-semibold">{metadata.departamento || '—'}</p>
            </div>
            <div>
              <p className="opacity-80 mb-1">Data da Análise</p>
              <p className="text-xl font-semibold">
                {metadata.data ? new Date(metadata.data).toLocaleDateString('pt-BR') : '—'}
              </p>
            </div>
            <div>
              <p className="opacity-80 mb-1">Status</p>
              <p className="text-xl font-semibold">✅ Análise Completa</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="flex flex-wrap border-b border-gray-200">
            {[
              { id: 'overview', label: '📊 Resumo Executivo', icon: '📊' },
              { id: 'dpt', label: '📝 Descrição DPT', icon: '📝' },
              { id: 'bpmn', label: '📐 Diagrama BPMN', icon: '📐' },
              { id: 'kpi', label: '📈 Indicadores KPI', icon: '📈' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <ExecutiveSummary dpt={dpt} bpmn={bpmn} kpis={kpis} kpiSummary={kpiSummary} metadata={metadata} />
            )}

            {/* DPT Tab */}
            {activeTab === 'dpt' && <DPTReview dpt={dpt} />}

            {/* BPMN Tab */}
            {activeTab === 'bpmn' && <BPMNReview bpmn={bpmn} />}

            {/* KPI Tab */}
            {activeTab === 'kpi' && <KPIReview kpis={kpis} kpiSummary={kpiSummary} />}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <button
            onClick={onPrevious}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ← Anterior
          </button>

          <button
            onClick={onNext}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Prosseguir →
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente: Resumo Executivo
 */
function ExecutiveSummary({ dpt, bpmn, kpis, kpiSummary, metadata }) {
  return (
    <div className="space-y-8">
      {/* Process Description */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">📋 Descrição do Processo</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{dpt?.descricao || 'Não definido'}</p>
      </div>

      {/* Key Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard
          title="🎯 Objetivo"
          content={dpt?.objetivo}
        />
        <InfoCard
          title="👥 Cliente/Beneficiário"
          content={dpt?.cliente_processo}
        />
        <InfoCard
          title="🔑 Proprietário"
          content={dpt?.proprietario}
        />
        <InfoCard
          title="🔄 Frequência"
          content={dpt?.frequencia}
        />
        <InfoCard
          title="⏱️ Tempo de Ciclo"
          content={dpt?.tempo_ciclo}
        />
        <InfoCard
          title="📥 Entrada"
          content={dpt?.entrada}
        />
      </div>

      {/* Statistics */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Estatísticas da Análise</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="Etapas" value={dpt?.etapas?.length || 0} />
          <StatBox label="Atores" value={dpt?.atores?.length || 0} />
          <StatBox label="Sistemas" value={dpt?.sistemas?.length || 0} />
          <StatBox label="KPIs" value={kpis?.length || 0} />
          {bpmn && (
            <>
              <StatBox label="Atividades" value={bpmn.activities?.length || 0} />
              <StatBox label="Gateways" value={bpmn.gateways?.length || 0} />
              <StatBox label="Fluxos" value={bpmn.sequenceFlows?.length || 0} />
              <StatBox label="Pools" value={bpmn.pools?.length || 0} />
            </>
          )}
        </div>
      </div>

      {/* Etapas */}
      {dpt?.etapas && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">🔄 Etapas do Processo</h3>
          <ol className="space-y-2">
            {dpt.etapas.map((etapa, idx) => (
              <li key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="font-bold text-blue-600 min-w-fit">{idx + 1}.</span>
                <div>
                  <p className="font-semibold text-gray-800">{etapa.titulo || etapa}</p>
                  {typeof etapa === 'object' && etapa.descricao && (
                    <p className="text-sm text-gray-600 mt-1">{etapa.descricao}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/**
 * Componente: Revisão DPT
 */
function DPTReview({ dpt }) {
  if (!dpt) {
    return <p className="text-gray-600">Nenhuma DPT carregada</p>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <pre className="text-sm text-gray-800 overflow-x-auto">
          {JSON.stringify(dpt, null, 2)}
        </pre>
      </div>
      <p className="text-sm text-gray-600">
        💡 A DPT contém {Object.keys(dpt).length} campos com informações estruturadas do processo.
      </p>
    </div>
  );
}

/**
 * Componente: Revisão BPMN
 */
function BPMNReview({ bpmn }) {
  if (!bpmn) {
    return <p className="text-gray-600">Nenhum diagrama BPMN disponível</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label="Atividades" value={bpmn.activities?.length || 0} />
        <StatBox label="Gateways" value={bpmn.gateways?.length || 0} />
        <StatBox label="Fluxos" value={bpmn.sequenceFlows?.length || 0} />
        <StatBox label="Pools" value={bpmn.pools?.length || 0} />
      </div>

      {bpmn.activities && bpmn.activities.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-800 mb-3">Atividades</h3>
          <div className="space-y-2">
            {bpmn.activities.map((activity, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                <p className="font-semibold text-gray-800">{activity.name || `Atividade ${idx + 1}`}</p>
                {activity.description && <p className="text-sm text-gray-600">{activity.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Componente: Revisão KPI
 */
function KPIReview({ kpis, kpiSummary }) {
  if (!kpis || kpis.length === 0) {
    return <p className="text-gray-600">Nenhum KPI gerado</p>;
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      {kpiSummary && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-3">Resumo de KPIs</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatBox label="Total" value={kpiSummary.total_kpis || 0} />
            {kpiSummary.by_criticality && (
              <>
                <StatBox label="Alta" value={kpiSummary.by_criticality['alta'] || 0} />
                <StatBox label="Média" value={kpiSummary.by_criticality['média'] || 0} />
                <StatBox label="Baixa" value={kpiSummary.by_criticality['baixa'] || 0} />
              </>
            )}
          </div>
        </div>
      )}

      {/* KPI List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
            <div className="flex justify-between items-start mb-2">
              <p className="font-bold text-gray-800">{kpi.indicador || `KPI ${idx + 1}`}</p>
              <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded">
                {kpi.criticidade || '—'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{kpi.objetivo}</p>
            <div className="flex gap-4 text-xs text-gray-600">
              <span>📊 {kpi.periodicidade || '—'}</span>
              <span>🎯 {kpi.meta || '—'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Componente reutilizável: InfoCard
 */
function InfoCard({ title, content }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h4 className="font-semibold text-gray-700 mb-2">{title}</h4>
      <p className="text-gray-800 whitespace-pre-wrap">{content || '—'}</p>
    </div>
  );
}

/**
 * Componente reutilizável: StatBox
 */
function StatBox({ label, value }) {
  return (
    <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-2xl font-bold text-blue-600">{value}</p>
    </div>
  );
}
