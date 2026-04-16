import { useState } from 'react';
import { useDPT } from '../hooks';

/**
 * Página 2: ANÁLISE - Revisão e edição da DPT extraída
 * Permite ao usuário revisar a estrutura DPT gerada pelo Azure OpenAI
 * Possibilita edição de campos individuais antes de prosseguir
 */
export default function AnalysisPage({ onNext, onPrevious }) {
  const {
    dpt,
    updateDPTField,
    updateDPTFields,
    validateDPT,
    getDPTStructure,
    loading,
    error,
  } = useDPT();

  const [expandedSections, setExpandedSections] = useState({
    basico: true,
    atividades: true,
    atores: true,
    sistemas: true,
    problemas: true,
  });

  const [validationResult, setValidationResult] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [validationMessage, setValidationMessage] = useState('');

  const dptStructure = getDPTStructure();

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleFieldChange = (field, value) => {
    updateDPTField(field, value);
    setEditingField(null);
  };

  const handleValidate = async () => {
    try {
      const result = await validateDPT();
      setValidationResult(result);
      setValidationMessage(
        result.is_valid
          ? '✅ DPT válida! Pronta para prosseguir'
          : '⚠️ DPT incompleta. Complete os campos faltantes'
      );
    } catch (err) {
      setValidationMessage(`❌ Erro na validação: ${err.message}`);
    }
  };

  const handleContinue = async () => {
    try {
      const result = await validateDPT();
      if (result.is_valid) {
        onNext();
      } else {
        setValidationMessage('⚠️ Preencha todos os campos obrigatórios antes de continuar');
      }
    } catch (err) {
      setValidationMessage(`❌ Erro: ${err.message}`);
    }
  };

  if (!dpt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <p className="text-xl text-gray-600 mb-4">⏳ Nenhuma DPT carregada</p>
          <button
            onClick={onPrevious}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Voltar para Entrada
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📊 ANÁLISE - Revisão da DPT
          </h1>
          <p className="text-gray-600 text-lg">
            Etapa 2/8 - Revise e corrija os dados extraídos do processo
          </p>
        </div>

        {/* Completion Status */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Status de Conclusão</h2>
            <span className="text-3xl font-bold text-blue-600">{dptStructure.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
              style={{ width: `${dptStructure.percentage}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Campos Preenchidos</p>
              <p className="text-2xl font-bold text-green-600">{dptStructure.presentFields.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Campos Faltantes</p>
              <p className="text-2xl font-bold text-red-600">{dptStructure.missingFields.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-600">16</p>
            </div>
          </div>
        </div>

        {/* Validation Message */}
        {validationMessage && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              validationMessage.includes('✅')
                ? 'bg-green-50 border-green-200 text-green-800'
                : validationMessage.includes('⚠️')
                ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {validationMessage}
          </div>
        )}

        {/* DPT Sections */}
        <div className="space-y-4">
          {/* Informações Básicas */}
          <SectionCollapsible
            title="📋 Informações Básicas"
            isOpen={expandedSections.basico}
            onToggle={() => toggleSection('basico')}
            fields={[
              { key: 'nome_processo', label: 'Nome do Processo' },
              { key: 'descricao', label: 'Descrição', multiline: true },
              { key: 'objetivo', label: 'Objetivo', multiline: true },
              { key: 'cliente_processo', label: 'Cliente/Beneficiário' },
              { key: 'proprietario', label: 'Proprietário' },
              { key: 'departamento_dono', label: 'Departamento' },
            ]}
            dpt={dpt}
            editingField={editingField}
            onFieldChange={handleFieldChange}
            setEditingField={setEditingField}
          />

          {/* Características do Processo */}
          <SectionCollapsible
            title="⚙️ Características do Processo"
            isOpen={expandedSections.atividades}
            onToggle={() => toggleSection('atividades')}
            fields={[
              { key: 'finalidade', label: 'Finalidade', multiline: true },
              { key: 'gatilho', label: 'Gatilho/Início', multiline: true },
              { key: 'entrada', label: 'Entrada' },
              { key: 'saida', label: 'Saída' },
              { key: 'frequencia', label: 'Frequência' },
              { key: 'tempo_ciclo', label: 'Tempo de Ciclo' },
            ]}
            dpt={dpt}
            editingField={editingField}
            onFieldChange={handleFieldChange}
            setEditingField={setEditingField}
          />

          {/* Etapas */}
          <SectionCollapsible
            title="🔄 Etapas do Processo"
            isOpen={expandedSections.atores}
            onToggle={() => toggleSection('atores')}
            dpt={dpt}
            editingField={editingField}
            onFieldChange={handleFieldChange}
            setEditingField={setEditingField}
            isEtapas={true}
          />

          {/* Atores */}
          <SectionCollapsible
            title="👥 Atores/Responsáveis"
            isOpen={expandedSections.sistemas}
            onToggle={() => toggleSection('sistemas')}
            dpt={dpt}
            editingField={editingField}
            onFieldChange={handleFieldChange}
            setEditingField={setEditingField}
            isAtores={true}
          />

          {/* Sistemas e Problemas */}
          <SectionCollapsible
            title="🖥️ Sistemas e Problemas"
            isOpen={expandedSections.problemas}
            onToggle={() => toggleSection('problemas')}
            fields={[
              { key: 'sistemas', label: 'Sistemas Envolvidos', multiline: true },
              { key: 'problemas_relatados', label: 'Problemas Relatados', multiline: true },
            ]}
            dpt={dpt}
            editingField={editingField}
            onFieldChange={handleFieldChange}
            setEditingField={setEditingField}
          />
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-between gap-4">
          <button
            onClick={onPrevious}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>

          <button
            onClick={handleValidate}
            disabled={loading}
            className="px-6 py-3 border border-blue-300 rounded-lg font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ✓ Validar DPT
          </button>

          <button
            onClick={handleContinue}
            disabled={loading || !dptStructure.complete}
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
 * Componente reutilizável para seções colapsáveis
 */
function SectionCollapsible({
  title,
  isOpen,
  onToggle,
  fields = [],
  dpt,
  editingField,
  onFieldChange,
  setEditingField,
  isEtapas = false,
  isAtores = false,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <span className={`text-2xl transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="px-6 py-4 border-t border-gray-200 space-y-4">
          {isEtapas && dpt.etapas ? (
            <div className="space-y-3">
              {Array.isArray(dpt.etapas) ? (
                dpt.etapas.map((etapa, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="font-medium text-gray-700">{idx + 1}. {etapa.titulo || 'Etapa'}</p>
                    <p className="text-sm text-gray-600 mt-1">{etapa.descricao}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">Sem etapas definidas</p>
              )}
            </div>
          ) : isAtores && dpt.atores ? (
            <div className="space-y-2">
              {Array.isArray(dpt.atores) ? (
                dpt.atores.map((ator, idx) => (
                  <div key={idx} className="p-2 bg-gray-50 rounded">
                    <p className="font-medium text-gray-700">👤 {ator}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">Sem atores definidos</p>
              )}
            </div>
          ) : (
            fields.map(({ key, label, multiline }) => (
              <FieldEditor
                key={key}
                field={key}
                label={label}
                value={dpt[key] || ''}
                multiline={multiline}
                isEditing={editingField === key}
                onEdit={() => setEditingField(key)}
                onSave={(value) => onFieldChange(key, value)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Componente de editor de campo individual
 */
function FieldEditor({ field, label, value, multiline, isEditing, onEdit, onSave }) {
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
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {multiline ? (
          <textarea
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            rows="3"
            className="w-full px-3 py-2 border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="w-full px-3 py-2 border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        )}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600"
          >
            Salvar
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onEdit}
      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors group"
    >
      <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
      <p className="text-gray-800 whitespace-pre-wrap">{value || '(vazio)'}</p>
      <p className="text-xs text-blue-600 group-hover:text-blue-700 mt-2">✏️ Clique para editar</p>
    </div>
  );
}
