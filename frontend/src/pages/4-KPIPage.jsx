import { useState, useEffect } from 'react';
import { useDPT, useKPI } from '../hooks';

/**
 * Página 4: INDICADORES - Visualização e edição de KPIs
 * Exibe a tabela de KPIs com 16 colunas estruturadas
 * Permite filtros, edição e validação dos indicadores
 */
export default function KPIPage({ onNext, onPrevious }) {
  const { dpt } = useDPT();
  const {
    kpis,
    summary,
    filters,
    generateKPIs,
    updateKPIField,
    filterByCriticality,
    filterByPeriodicity,
    filterByPolarity,
    getFilteredKPIs,
    getKPIStats,
    loading,
    error,
  } = useKPI();

  const [generatingError, setGeneratingError] = useState('');
  const [editingCell, setEditingCell] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Generate KPIs on component mount
  useEffect(() => {
    if (dpt && kpis.length === 0) {
      handleGenerateKPIs();
    }
  }, [dpt, kpis.length]);

  const handleGenerateKPIs = async () => {
    setGeneratingError('');
    try {
      await generateKPIs(dpt, dpt.nome_processo || '');
    } catch (err) {
      setGeneratingError(err.message || 'Erro ao gerar KPIs');
    }
  };

  const filteredKPIs = getFilteredKPIs();
  const stats = getKPIStats();

  const KPI_COLUMNS = [
    'indicador',
    'objetivo',
    'processo',
    'cliente',
    'metadados',
    'fonte_extracao',
    'formula_calculo',
    'unidade',
    'filtro',
    'meta',
    'periodicidade',
    'polaridade',
    'responsavel',
    'criticidade',
    'justificativa',
  ];

  const COLUMN_LABELS = {
    indicador: 'Indicador',
    objetivo: 'Objetivo',
    processo: 'Processo',
    cliente: 'Cliente',
    metadados: 'Metadados',
    fonte_extracao: 'Fonte de Extração',
    formula_calculo: 'Fórmula de Cálculo',
    unidade: 'Unidade',
    filtro: 'Filtro',
    meta: 'Meta',
    periodicidade: 'Periodicidade',
    polaridade: 'Polaridade',
    responsavel: 'Responsável',
    criticidade: 'Criticidade',
    justificativa: 'Justificativa',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📊 INDICADORES - KPIs do Processo
          </h1>
          <p className="text-gray-600 text-lg">
            Etapa 4/8 - Revise e valide os indicadores gerados
          </p>
        </div>

        {/* Error Messages */}
        {(generatingError || error) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">❌ {generatingError || error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && kpis.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <p className="text-xl text-gray-600 mb-4">⏳ Gerando KPIs...</p>
            <div className="inline-block animate-spin text-4xl">⚙️</div>
          </div>
        )}

        {/* Content */}
        {!loading && kpis.length > 0 && (
          <>
            {/* Statistics and Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
              {/* Total KPIs */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <p className="text-gray-600 text-sm mb-1">Total de KPIs</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>

              {/* Completion */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <p className="text-gray-600 text-sm mb-1">Completude</p>
                <p className="text-3xl font-bold text-green-600">{stats.completionPercentage}%</p>
              </div>

              {/* High Criticality */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <p className="text-gray-600 text-sm mb-1">Alta Criticidade</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.byCriticality['alta'] || 0}
                </p>
              </div>

              {/* Filter Toggle */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full h-full flex flex-col items-center justify-center hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <p className="text-2xl mb-1">🔍</p>
                  <p className="text-sm font-medium text-blue-600">
                    {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                  </p>
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                <h3 className="font-semibold text-lg mb-4">🔍 Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Criticality Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Criticidade
                    </label>
                    <select
                      value={filters.criticality}
                      onChange={(e) => filterByCriticality(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos</option>
                      <option value="alta">Alta</option>
                      <option value="média">Média</option>
                      <option value="baixa">Baixa</option>
                    </select>
                  </div>

                  {/* Periodicity Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Periodicidade
                    </label>
                    <select
                      value={filters.periodicity || ''}
                      onChange={(e) => filterByPeriodicity(e.target.value || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todos</option>
                      <option value="diária">Diária</option>
                      <option value="semanal">Semanal</option>
                      <option value="mensal">Mensal</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>

                  {/* Polarity Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Polaridade
                    </label>
                    <select
                      value={filters.polarity || ''}
                      onChange={(e) => filterByPolarity(e.target.value || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todos</option>
                      <option value="maximizar">Maximizar</option>
                      <option value="minimizar">Minimizar</option>
                      <option value="manter">Manter</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* KPI Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800 text-white sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>
                      {KPI_COLUMNS.map((col) => (
                        <th key={col} className="px-4 py-3 text-left whitespace-nowrap">
                          {COLUMN_LABELS[col]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKPIs.map((kpi, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-600">{idx + 1}</td>
                        {KPI_COLUMNS.map((col) => (
                          <KPICell
                            key={`${idx}-${col}`}
                            value={kpi[col] || ''}
                            kpiIndex={idx}
                            columnName={col}
                            isEditing={editingCell === `${idx}-${col}`}
                            onEdit={() => setEditingCell(`${idx}-${col}`)}
                            onSave={(newValue) => {
                              updateKPIField(idx, col, newValue);
                              setEditingCell(null);
                            }}
                          />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredKPIs.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-gray-600 text-lg">
                    ℹ️ Nenhum KPI corresponde aos filtros selecionados
                  </p>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                💡 Clique em qualquer célula para editar | Exibindo {filteredKPIs.length} de {stats.total} KPIs
              </p>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && kpis.length === 0 && !generatingError && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <p className="text-xl text-gray-600 mb-4">📭 Nenhum KPI gerado ainda</p>
            <button
              onClick={handleGenerateKPIs}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Gerar KPIs
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between gap-4">
          <button
            onClick={onPrevious}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>

          <button
            onClick={onNext}
            disabled={loading || kpis.length === 0}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processando...' : 'Prosseguir →'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente para célula editável de KPI
 */
function KPICell({ value, kpiIndex, columnName, isEditing, onEdit, onSave }) {
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onSave(tempValue);
  };

  const handleCancel = () => {
    setTempValue(value);
    onEdit();
  };

  if (isEditing) {
    return (
      <td className="px-4 py-3 bg-blue-100">
        <div className="flex gap-1">
          <input
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="flex-1 px-2 py-1 border border-blue-400 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
          >
            ✓
          </button>
          <button
            onClick={handleCancel}
            className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
          >
            ✕
          </button>
        </div>
      </td>
    );
  }

  const displayValue = value ? value.toString().substring(0, 30) : '';
  const hasMoreContent = value && value.toString().length > 30;

  return (
    <td
      onClick={onEdit}
      className="px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors text-xs"
      title={value}
    >
      <span>{displayValue}</span>
      {hasMoreContent && <span className="text-blue-600">...</span>}
    </td>
  );
}
