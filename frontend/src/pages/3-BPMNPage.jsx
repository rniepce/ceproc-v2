import { useState, useEffect } from 'react';
import { useDPT, useBPMN } from '../hooks';

/**
 * Página 3: VISUAL BPMN - Visualização do diagrama de processo
 * Renderiza o diagrama BPMN gerado a partir da DPT
 * Permite interação com elementos do diagrama e edição manual
 */
export default function BPMNPage({ onNext, onPrevious }) {
  const { dpt } = useDPT();
  const { bpmn, generateBPMN, validateBPMN, selectedElement, setSelectedElement, loading, error } = useBPMN();

  const [showXML, setShowXML] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null);
  const [generateError, setGenerateError] = useState('');

  // Generate BPMN on component mount or when DPT changes
  useEffect(() => {
    if (dpt && !bpmn) {
      handleGenerateBPMN();
    }
  }, [dpt, bpmn]);

  const handleGenerateBPMN = async () => {
    setGenerateError('');
    try {
      const result = await generateBPMN(dpt);
      if (result) {
        // Validate the generated BPMN
        await handleValidate(result.bpmn_json);
      }
    } catch (err) {
      setGenerateError(err.message || 'Erro ao gerar BPMN');
    }
  };

  const handleValidate = async (bpmnData = bpmn) => {
    try {
      const result = await validateBPMN(bpmnData);
      setValidationStatus(result);
    } catch (err) {
      setGenerateError(err.message || 'Erro ao validar BPMN');
    }
  };

  const handleContinue = () => {
    if (validationStatus?.is_valid) {
      onNext();
    } else {
      setGenerateError('⚠️ BPMN inválida. Por favor, revise antes de continuar.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📐 VISUAL BPMN - Diagrama do Processo
          </h1>
          <p className="text-gray-600 text-lg">
            Etapa 3/8 - Visualize e valide o diagrama BPMN 2.0 gerado
          </p>
        </div>

        {/* Error Messages */}
        {(generateError || error) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">❌ {generateError || error}</p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Diagram Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              {loading ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xl text-gray-600 mb-4">⏳ Gerando diagrama BPMN...</p>
                    <div className="inline-block animate-spin">⚙️</div>
                  </div>
                </div>
              ) : bpmn ? (
                <div>
                  <BPMNRenderer bpmn={bpmn} selectedElement={selectedElement} onSelectElement={setSelectedElement} />
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xl text-gray-600 mb-4">📭 Nenhum diagrama disponível</p>
                    <button
                      onClick={handleGenerateBPMN}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                    >
                      Gerar Diagrama
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Stats and Details */}
          <div className="space-y-4">
            {/* Validation Status */}
            {validationStatus && (
              <div className={`rounded-2xl shadow-xl p-6 ${
                validationStatus.is_valid
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-yellow-50 border-2 border-yellow-200'
              }`}>
                <h3 className="font-semibold text-lg mb-4">
                  {validationStatus.is_valid ? '✅ BPMN Válida' : '⚠️ BPMN Inválida'}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Elementos:</span>
                    <span className="font-bold">{validationStatus.elements_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Fluxos:</span>
                    <span className="font-bold">{validationStatus.flows_count || 0}</span>
                  </div>
                  {validationStatus.errors && validationStatus.errors.length > 0 && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
                      <p className="font-semibold text-red-800 text-xs mb-2">Erros:</p>
                      <ul className="text-red-700 text-xs space-y-1">
                        {validationStatus.errors.map((err, idx) => (
                          <li key={idx}>• {err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Statistics */}
            {bpmn && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="font-semibold text-lg mb-4">📊 Estatísticas</h3>
                <div className="space-y-3 text-sm">
                  <StatItem label="Atividades" value={bpmn.activities?.length || 0} />
                  <StatItem label="Gateways" value={bpmn.gateways?.length || 0} />
                  <StatItem label="Fluxos" value={bpmn.sequenceFlows?.length || 0} />
                  <StatItem label="Pools" value={bpmn.pools?.length || 0} />
                </div>
              </div>
            )}

            {/* Element Details */}
            {selectedElement && (
              <div className="bg-blue-50 rounded-2xl shadow-xl p-6 border-2 border-blue-200">
                <h3 className="font-semibold text-lg mb-4">🔍 Detalhes do Elemento</h3>
                <div className="text-sm space-y-2 max-h-48 overflow-y-auto">
                  <div>
                    <p className="text-gray-600">ID:</p>
                    <p className="font-mono text-blue-600">{selectedElement.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Nome:</p>
                    <p className="font-medium">{selectedElement.name || '(sem nome)'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tipo:</p>
                    <p className="font-medium">{selectedElement.type || 'desconhecido'}</p>
                  </div>
                  {selectedElement.x && selectedElement.y && (
                    <div>
                      <p className="text-gray-600">Coordenadas:</p>
                      <p className="font-mono text-sm">({selectedElement.x}, {selectedElement.y})</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-3">
              <button
                onClick={() => setShowXML(!showXML)}
                className="w-full px-4 py-2 border border-blue-300 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm"
              >
                {showXML ? '👁️ Ocultar XML' : '📋 Ver XML'}
              </button>
              <button
                onClick={handleValidate}
                className="w-full px-4 py-2 border border-purple-300 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors text-sm"
              >
                ✓ Revalidar
              </button>
            </div>
          </div>
        </div>

        {/* XML View */}
        {showXML && bpmn && (
          <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
            <h3 className="font-semibold text-lg mb-4">📋 BPMN JSON</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs max-h-96">
              {JSON.stringify(bpmn, null, 2)}
            </pre>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between gap-4">
          <button
            onClick={onPrevious}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>

          <button
            onClick={handleContinue}
            disabled={loading || !validationStatus?.is_valid}
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
 * Componente que renderiza o diagrama BPMN como SVG
 */
function BPMNRenderer({ bpmn, selectedElement, onSelectElement }) {
  const canvasWidth = 800;
  const canvasHeight = 600;
  const padding = 40;

  // Simple layout: arrange activities horizontally
  const activities = bpmn.activities || [];
  const gateways = bpmn.gateways || [];

  return (
    <div className="w-full flex flex-col">
      <svg
        width="100%"
        height={canvasHeight}
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        className="border border-gray-300 rounded-lg bg-gray-50"
      >
        {/* Draw sequence flows */}
        {bpmn.sequenceFlows?.map((flow, idx) => (
          <line
            key={`flow-${idx}`}
            x1={flow.sourceX || 100 + idx * 80}
            y1={flow.sourceY || 150}
            x2={flow.targetX || 180 + idx * 80}
            y2={flow.targetY || 150}
            stroke="#666"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
        ))}

        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#666" />
          </marker>
        </defs>

        {/* Start Event */}
        <circle
          cx="50"
          cy="150"
          r="20"
          fill="#90EE90"
          stroke="#333"
          strokeWidth="2"
          onClick={() => onSelectElement({ id: 'startEvent', name: 'Start', type: 'StartEvent' })}
          style={{ cursor: 'pointer' }}
        />
        <text x="50" y="195" textAnchor="middle" fontSize="12" fill="#333">
          Início
        </text>

        {/* Activities */}
        {activities.map((activity, idx) => {
          const x = 150 + idx * 120;
          const y = 150;
          const isSelected = selectedElement?.id === activity.id;

          return (
            <g key={`activity-${idx}`} onClick={() => onSelectElement(activity)}>
              <rect
                x={x - 40}
                y={y - 30}
                width="80"
                height="60"
                fill={isSelected ? '#87CEEB' : '#FFD700'}
                stroke={isSelected ? '#0066CC' : '#333'}
                strokeWidth={isSelected ? '3' : '2'}
                rx="5"
                style={{ cursor: 'pointer' }}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fill="#333"
                fontWeight="500"
              >
                {activity.name || `Atividade ${idx + 1}`}
              </text>
            </g>
          );
        })}

        {/* Gateways */}
        {gateways.map((gateway, idx) => {
          const x = 150 + activities.length * 120 + idx * 80;
          const y = 150;
          const isSelected = selectedElement?.id === gateway.id;

          return (
            <g key={`gateway-${idx}`} onClick={() => onSelectElement(gateway)}>
              <polygon
                points={`${x},${y - 25} ${x + 25},${y} ${x},${y + 25} ${x - 25},${y}`}
                fill={isSelected ? '#87CEEB' : '#FFA500'}
                stroke={isSelected ? '#0066CC' : '#333'}
                strokeWidth={isSelected ? '3' : '2'}
                style={{ cursor: 'pointer' }}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fill="#333"
                fontWeight="500"
              >
                {gateway.gatewayDirection === 'Diverging' ? '✕' : '◊'}
              </text>
            </g>
          );
        })}

        {/* End Event */}
        <circle
          cx={canvasWidth - 50}
          cy="150"
          r="20"
          fill="#FFB6C6"
          stroke="#333"
          strokeWidth="2"
          onClick={() => onSelectElement({ id: 'endEvent', name: 'End', type: 'EndEvent' })}
          style={{ cursor: 'pointer' }}
        />
        <text x={canvasWidth - 50} y="195" textAnchor="middle" fontSize="12" fill="#333">
          Fim
        </text>
      </svg>

      <p className="text-xs text-gray-500 mt-2">
        💡 Clique em elementos para ver detalhes | Diagrama simplificado para visualização
      </p>
    </div>
  );
}

/**
 * Componente para exibir estatísticas
 */
function StatItem({ label, value }) {
  return (
    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
      <span className="text-gray-700">{label}:</span>
      <span className="font-bold text-blue-600">{value}</span>
    </div>
  );
}
