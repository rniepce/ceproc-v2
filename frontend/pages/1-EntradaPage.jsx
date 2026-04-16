import { useState } from 'react';
import { useDPT } from '../hooks';

/**
 * Página 1: ENTRADA - Coleta de dados da entrevista
 * Permite ao usuário inserir texto da entrevista e metadados do processo
 * Realiza validação básica e envio para análise com Azure OpenAI
 */
export default function EntradaPage({ onNext, onPrevious }) {
  const { extractDPT, loading, error, metadata, updateMetadata } = useDPT();
  const [interviewText, setInterviewText] = useState('');
  const [validationError, setValidationError] = useState('');
  const [charCount, setCharCount] = useState(0);

  const MIN_CHARS = 100;
  const MAX_CHARS = 100000;

  const handleTextChange = (e) => {
    const text = e.target.value;
    setInterviewText(text);
    setCharCount(text.length);
    setValidationError('');
  };

  const handleMetadataChange = (field, value) => {
    updateMetadata(field, value);
  };

  const handleContinue = async () => {
    // Validate input
    if (!interviewText || interviewText.trim().length === 0) {
      setValidationError('Por favor, insira o texto da entrevista');
      return;
    }

    if (interviewText.length < MIN_CHARS) {
      setValidationError(`Texto insuficiente. Mínimo: ${MIN_CHARS} caracteres (atual: ${charCount})`);
      return;
    }

    if (interviewText.length > MAX_CHARS) {
      setValidationError(`Texto muito longo. Máximo: ${MAX_CHARS} caracteres`);
      return;
    }

    // Validate metadata
    if (!metadata.processo || !metadata.processo.trim()) {
      setValidationError('Por favor, defina o nome do processo');
      return;
    }

    if (!metadata.analista || !metadata.analista.trim()) {
      setValidationError('Por favor, defina o nome do analista');
      return;
    }

    try {
      // Extract DPT using Azure OpenAI
      const result = await extractDPT(interviewText);
      if (result) {
        onNext();
      }
    } catch (err) {
      setValidationError(err.message || 'Erro ao processar entrevista');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📝 ENTRADA - Análise de Processo
          </h1>
          <p className="text-gray-600 text-lg">
            Etapa 1/8 - Insira os dados da entrevista do processo
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* Metadata Section */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Metadados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Process Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Processo *
                </label>
                <input
                  type="text"
                  value={metadata.processo}
                  onChange={(e) => handleMetadataChange('processo', e.target.value)}
                  placeholder="Ex: Requisição de Compras"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Analyst Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Analista *
                </label>
                <input
                  type="text"
                  value={metadata.analista}
                  onChange={(e) => handleMetadataChange('analista', e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento
                </label>
                <input
                  type="text"
                  value={metadata.departamento}
                  onChange={(e) => handleMetadataChange('departamento', e.target.value)}
                  placeholder="Ex: Suprimentos"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={metadata.data ? metadata.data.split('T')[0] : ''}
                  onChange={(e) =>
                    handleMetadataChange('data', new Date(e.target.value).toISOString())
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Interview Text Section */}
          <div className="mb-6">
            <div className="flex justify-between items-baseline mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Texto da Entrevista *
              </label>
              <span className={`text-sm ${
                charCount < MIN_CHARS ? 'text-red-500' : 'text-gray-500'
              }`}>
                {charCount} / {MAX_CHARS} caracteres
              </span>
            </div>
            <textarea
              value={interviewText}
              onChange={handleTextChange}
              placeholder="Cole aqui o texto completo da entrevista do processo. Inclua detalhes sobre atividades, responsáveis, sistemas envolvidos, etc."
              rows="12"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            <p className="mt-2 text-xs text-gray-500">
              Mínimo: {MIN_CHARS} caracteres | Máximo: {MAX_CHARS} caracteres
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  charCount < MIN_CHARS ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min((charCount / MAX_CHARS) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Error Message */}
          {(validationError || error) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">❌ {validationError || error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Dicas para melhor resultado:</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Descreva o processo passo a passo</li>
              <li>• Inclua nomes de pessoas, departamentos e sistemas envolvidos</li>
              <li>• Mencionetempo de ciclo e frequência do processo</li>
              <li>• Descreva problemas ou gargalos identificados</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex justify-between gap-4">
            <button
              onClick={onPrevious}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            <button
              onClick={handleContinue}
              disabled={loading || charCount < MIN_CHARS || !metadata.processo || !metadata.analista}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Processando...
                </>
              ) : (
                <>
                  Analisar →
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-gray-600 text-sm">
          <p>💾 Seus dados serão processados com Azure OpenAI para análise inteligente do processo</p>
        </div>
      </div>
    </div>
  );
}
