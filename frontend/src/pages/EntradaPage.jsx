import { useState, useRef } from 'react';
import { useAPI } from '../hooks';

const MIN_CHARS = 100;
const MAX_CHARS = 100000;

/**
 * EntradaPage – Step 1 of the CEPROC V2 wizard.
 *
 * Collects the interview text and process metadata, then calls /api/dpt to
 * extract the DPT structure.  All state is stored in the shared `workflow`
 * object passed down from App.jsx so subsequent steps can access it.
 */
export default function EntradaPage({ onNext, onPrevious, workflow }) {
  const { entrada, setEntrada, updateMetadata, setDPT } = workflow;
  const { interviewText, metadata } = entrada;

  const [charCount, setCharCount] = useState(interviewText.length);
  const [validationError, setValidationError] = useState('');
  const [audioFileName, setAudioFileName] = useState('');
  const audioInputRef = useRef(null);

  const dptAPI = useAPI('/api/dpt', 'POST');

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleTextChange = (e) => {
    const text = e.target.value;
    setEntrada(text, undefined);
    setCharCount(text.length);
    setValidationError('');
  };

  const handleMetadataChange = (field, value) => {
    updateMetadata(field, value);
    setValidationError('');
  };

  const handleAudioChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFileName(file.name);
      // Audio transcription is a future feature; inform the user.
      setValidationError(
        'Upload de áudio detectado. A transcrição automática será implementada em breve. Por favor, cole o texto manualmente.'
      );
    }
  };

  const handleContinue = async () => {
    setValidationError('');

    if (!interviewText || interviewText.trim().length === 0) {
      setValidationError('Por favor, insira o texto da entrevista.');
      return;
    }
    if (interviewText.length < MIN_CHARS) {
      setValidationError(
        `Texto insuficiente. Mínimo: ${MIN_CHARS} caracteres (atual: ${charCount}).`
      );
      return;
    }
    if (interviewText.length > MAX_CHARS) {
      setValidationError(`Texto muito longo. Máximo: ${MAX_CHARS} caracteres.`);
      return;
    }
    if (!metadata.processo || !metadata.processo.trim()) {
      setValidationError('Por favor, defina o nome do processo.');
      return;
    }
    if (!metadata.analista || !metadata.analista.trim()) {
      setValidationError('Por favor, defina o nome do analista.');
      return;
    }

    try {
      const payload = {
        interview_text: interviewText,
        process_name: metadata.processo || null,
        analyst: metadata.analista || null,
        department: metadata.departamento || null,
        date: metadata.data || null,
      };

      const result = await dptAPI.execute(payload);

      // Store the extracted DPT in the shared workflow state
      if (result && result.dpt) {
        setDPT(result.dpt);
      } else if (result) {
        setDPT(result);
      }

      onNext();
    } catch (err) {
      setValidationError(err.message || 'Erro ao processar entrevista. Tente novamente.');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const charBarWidth = Math.min((charCount / MAX_CHARS) * 100, 100);
  const charBarColor = charCount < MIN_CHARS ? 'bg-red-500' : 'bg-green-500';
  const isReady =
    charCount >= MIN_CHARS &&
    charCount <= MAX_CHARS &&
    metadata.processo?.trim() &&
    metadata.analista?.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📝 ENTRADA — Captura de Entrevista
          </h1>
          <p className="text-gray-600 text-lg">
            Etapa 1/8 · Insira o texto da entrevista e os metadados do processo
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* ── Metadata ── */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Metadados do Processo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Process name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Processo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={metadata.processo}
                  onChange={(e) => handleMetadataChange('processo', e.target.value)}
                  placeholder="Ex: Requisição de Compras"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Analyst */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Analista <span className="text-red-500">*</span>
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
                  Data da Entrevista
                </label>
                <input
                  type="date"
                  value={metadata.data || ''}
                  onChange={(e) => handleMetadataChange('data', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* ── Audio upload (placeholder) ── */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              🎙️ Upload de Áudio{' '}
              <span className="text-sm font-normal text-gray-500">(opcional — em breve)</span>
            </h2>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              onClick={() => audioInputRef.current?.click()}
            >
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleAudioChange}
              />
              {audioFileName ? (
                <p className="text-gray-700 font-medium">🎵 {audioFileName}</p>
              ) : (
                <>
                  <p className="text-gray-500 text-lg mb-1">Arraste um arquivo de áudio ou clique para selecionar</p>
                  <p className="text-gray-400 text-sm">MP3, WAV, M4A, OGG — transcrição automática em breve</p>
                </>
              )}
            </div>
          </div>

          {/* ── Interview text ── */}
          <div className="mb-6">
            <div className="flex justify-between items-baseline mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Texto da Entrevista <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-sm font-medium ${
                  charCount < MIN_CHARS ? 'text-red-500' : 'text-gray-500'
                }`}
              >
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} caracteres
              </span>
            </div>
            <textarea
              value={interviewText}
              onChange={handleTextChange}
              placeholder="Cole aqui o texto completo da entrevista do processo. Inclua detalhes sobre atividades, responsáveis, sistemas envolvidos, problemas identificados, etc."
              rows={14}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-y"
            />

            {/* Character progress bar */}
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${charBarColor}`}
                style={{ width: `${charBarWidth}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Mínimo: {MIN_CHARS} caracteres · Máximo: {MAX_CHARS.toLocaleString()} caracteres
            </p>
          </div>

          {/* ── Error / API error ── */}
          {(validationError || dptAPI.error) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">
                ❌ {validationError || dptAPI.error}
              </p>
            </div>
          )}

          {/* ── Tips ── */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Dicas para melhor resultado</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Descreva o processo passo a passo com o máximo de detalhes</li>
              <li>• Inclua nomes de pessoas, departamentos e sistemas envolvidos</li>
              <li>• Mencione tempo de ciclo, frequência e volume do processo</li>
              <li>• Descreva problemas, gargalos e oportunidades de melhoria</li>
            </ul>
          </div>

          {/* ── Navigation ── */}
          <div className="flex justify-between gap-4">
            <button
              onClick={onPrevious}
              disabled={dptAPI.loading}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            <button
              onClick={handleContinue}
              disabled={dptAPI.loading || !isReady}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {dptAPI.loading ? (
                <>
                  <span className="animate-spin inline-block">⏳</span>
                  Extraindo DPT…
                </>
              ) : (
                'Analisar com IA →'
              )}
            </button>
          </div>
        </div>

        <div className="text-center text-gray-500 text-sm">
          💾 O texto será processado pelo Azure OpenAI para extração estruturada do processo
        </div>
      </div>
    </div>
  );
}
