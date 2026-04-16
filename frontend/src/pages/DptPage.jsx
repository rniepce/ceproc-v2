import { useState } from 'react';

/**
 * DPT field definitions used for the structured preview.
 * Each entry maps a top-level key in the DPT response to a human-readable label.
 */
const DPT_SECTIONS = [
  {
    title: '📋 Negócio & Finalidade',
    fields: [
      { key: 'negocio', label: 'Negócio' },
      { key: 'finalidade', label: 'Finalidade' },
    ],
  },
  {
    title: '👥 Clientes & Normas',
    fields: [
      { key: 'clientes', label: 'Clientes' },
      { key: 'normas_reguladoras', label: 'Normas Reguladoras' },
    ],
  },
  {
    title: '🔄 Entradas, Etapas & Saídas',
    fields: [
      { key: 'descricoes_de_entrada', label: 'Entradas' },
      { key: 'principais_etapas', label: 'Etapas Principais' },
      { key: 'descricoes_de_saida', label: 'Saídas' },
    ],
  },
  {
    title: '🖥️ Atores & Sistemas',
    fields: [
      { key: 'atores', label: 'Atores' },
      { key: 'sistemas_e_infraestrutura', label: 'Sistemas & Infraestrutura' },
    ],
  },
  {
    title: '📈 Melhorias & Pontos Sensíveis',
    fields: [
      { key: 'expectativa_de_melhoria', label: 'Expectativa de Melhoria' },
      { key: 'pontos_sensiveis', label: 'Pontos Sensíveis' },
    ],
  },
];

/** Required top-level keys used for the validation status bar */
const REQUIRED_KEYS = [
  'metadados',
  'negocio',
  'finalidade',
  'conceitos_e_definicoes',
  'clientes',
  'normas_reguladoras',
  'descricoes_de_entrada',
  'principais_etapas',
  'descricoes_de_saida',
  'atores',
  'sistemas_e_infraestrutura',
  'expectativa_de_melhoria',
  'documentos_e_indicadores',
  'pontos_sensiveis',
];

/**
 * Render a DPT field value in a human-friendly way regardless of its type
 * (string, object with lista/descricao, or array).
 */
function FieldValue({ value }) {
  if (value === null || value === undefined) {
    return <span className="text-gray-400 italic">—</span>;
  }

  // Object with a lista property (SessaoComLista) — must be checked before
  // the generic Array and plain-object branches so the object is never passed
  // directly to JSX (which would trigger React error #31).
  if (typeof value === 'object' && !Array.isArray(value) && value.lista !== undefined) {
    const items = Array.isArray(value.lista) ? value.lista : [];
    return (
      <div>
        {value.descricao && (
          <p className="text-gray-600 text-sm mb-2 italic">{String(value.descricao)}</p>
        )}
        {items.length === 0 ? (
          <span className="text-gray-400 italic">—</span>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {items.map((item, i) => (
              <li key={i} className="text-gray-700 text-sm">
                {typeof item === 'object' ? JSON.stringify(item) : String(item)}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Array of strings or objects
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-400 italic">—</span>;
    return (
      <ul className="list-disc list-inside space-y-1">
        {value.map((item, i) => {
          if (item === null || item === undefined) return <li key={i} className="text-gray-700 text-sm">—</li>;
          // Nested SessaoComLista inside an array
          if (typeof item === 'object' && item.lista !== undefined) {
            const subItems = Array.isArray(item.lista) ? item.lista : [];
            return (
              <li key={i} className="text-gray-700 text-sm">
                {item.descricao ? <span className="italic text-gray-600">{String(item.descricao)}: </span> : null}
                {subItems.length > 0 ? subItems.map((s) => (typeof s === 'object' ? JSON.stringify(s) : String(s))).join(', ') : '—'}
              </li>
            );
          }
          // Generic object — extract a readable string property or fall back to JSON
          if (typeof item === 'object') {
            const label = item.etapa ?? item.descricao ?? item.termo ?? item.nome ?? null;
            return (
              <li key={i} className="text-gray-700 text-sm">
                {label !== null && typeof label !== 'object'
                  ? String(label)
                  : JSON.stringify(item)}
              </li>
            );
          }
          return <li key={i} className="text-gray-700 text-sm">{String(item)}</li>;
        })}
      </ul>
    );
  }

  // Plain object — render as JSON
  if (typeof value === 'object') {
    return (
      <pre className="text-xs text-gray-700 bg-gray-50 rounded p-2 overflow-x-auto">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return <span className="text-gray-700 text-sm">{String(value)}</span>;
}

/**
 * DptPage – Step 2 of the CEPROC V2 wizard.
 *
 * Displays the DPT extracted by /api/dpt, shows a validation status bar,
 * allows inline editing of any field, and provides Approve / Edit / Request
 * Improvement actions before proceeding.
 */
export default function DptPage({ onNext, onPrevious, workflow }) {
  const { dpt, updateDPTField, entrada } = workflow;

  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [approved, setApproved] = useState(false);
  const [improvementNote, setImprovementNote] = useState('');
  const [showImprovementForm, setShowImprovementForm] = useState(false);
  const [expandedSections, setExpandedSections] = useState(
    Object.fromEntries(DPT_SECTIONS.map((s) => [s.title, true]))
  );

  // ── Validation ────────────────────────────────────────────────────────────

  const presentKeys = dpt ? REQUIRED_KEYS.filter((k) => {
    const v = dpt[k];
    if (v === null || v === undefined) return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'object' && v.lista !== undefined) return v.lista.length > 0;
    if (typeof v === 'object') return Object.keys(v).length > 0;
    return String(v).trim().length > 0;
  }) : [];

  const missingKeys = REQUIRED_KEYS.filter((k) => !presentKeys.includes(k));
  const completionPct = Math.round((presentKeys.length / REQUIRED_KEYS.length) * 100);

  // ── Editing ───────────────────────────────────────────────────────────────

  const startEdit = (key, currentValue) => {
    setEditingKey(key);
    // Stringify objects for editing
    setEditValue(
      typeof currentValue === 'object'
        ? JSON.stringify(currentValue, null, 2)
        : String(currentValue ?? '')
    );
  };

  const saveEdit = () => {
    if (!editingKey) return;
    let parsed = editValue;
    try {
      parsed = JSON.parse(editValue);
    } catch {
      // Keep as string if not valid JSON
    }
    updateDPTField(editingKey, parsed);
    setEditingKey(null);
  };

  const cancelEdit = () => setEditingKey(null);

  const toggleSection = (title) =>
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));

  // ── No DPT guard ──────────────────────────────────────────────────────────

  if (!dpt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md">
          <p className="text-5xl mb-4">⚠️</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Nenhuma DPT disponível</h2>
          <p className="text-gray-600 mb-6">
            Volte à etapa anterior e processe o texto da entrevista primeiro.
          </p>
          <button
            onClick={onPrevious}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            ← Voltar para Entrada
          </button>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📄 DPT — Descrição do Processo de Trabalho
          </h1>
          <p className="text-gray-600 text-lg">
            Etapa 2/8 · Revise, edite e aprove a DPT extraída pela IA
          </p>
        </div>

        {/* ── Validation status ── */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-gray-800">Status de Validação</h2>
            <span
              className={`text-3xl font-bold ${
                completionPct === 100 ? 'text-green-600' : 'text-blue-600'
              }`}
            >
              {completionPct}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                completionPct === 100
                  ? 'bg-green-500'
                  : completionPct >= 70
                  ? 'bg-blue-500'
                  : 'bg-yellow-500'
              }`}
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-gray-500">Campos Presentes</p>
              <p className="text-2xl font-bold text-green-600">{presentKeys.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Campos Ausentes</p>
              <p className="text-2xl font-bold text-red-500">{missingKeys.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Total Esperado</p>
              <p className="text-2xl font-bold text-gray-600">{REQUIRED_KEYS.length}</p>
            </div>
          </div>

          {/* Missing fields list */}
          {missingKeys.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm font-medium mb-1">⚠️ Campos ausentes:</p>
              <p className="text-yellow-700 text-xs">{missingKeys.join(', ')}</p>
            </div>
          )}

          {/* Approved badge */}
          {approved && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">✅ DPT aprovada — pronta para prosseguir</p>
            </div>
          )}
        </div>

        {/* ── Metadados card ── */}
        {dpt.metadados && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🗂️ Metadados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {Object.entries(dpt.metadados).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="font-medium text-gray-600 capitalize min-w-fit">
                    {k.replace(/_/g, ' ')}:
                  </span>
                  <span className="text-gray-800">{String(v ?? '—')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DPT sections ── */}
        {DPT_SECTIONS.map((section) => (
          <div key={section.title} className="bg-white rounded-2xl shadow-xl overflow-hidden mb-4">
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
              <span
                className={`text-xl transition-transform duration-200 ${
                  expandedSections[section.title] ? 'rotate-180' : ''
                }`}
              >
                ▼
              </span>
            </button>

            {expandedSections[section.title] && (
              <div className="px-6 pb-6 border-t border-gray-100 space-y-5 pt-4">
                {section.fields.map(({ key, label }) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-gray-700">{label}</p>
                      {editingKey !== key && (
                        <button
                          onClick={() => startEdit(key, dpt[key])}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          ✏️ Editar
                        </button>
                      )}
                    </div>

                    {editingKey === key ? (
                      <div className="space-y-2">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          rows={6}
                          className="w-full px-3 py-2 border border-blue-400 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <p className="text-xs text-gray-500">
                          Edite o valor diretamente. Para campos estruturados, use JSON válido.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600"
                          >
                            ✓ Salvar
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <FieldValue value={dpt[key]} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* ── Raw JSON toggle ── */}
        <details className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
            🔍 Ver JSON completo da DPT
          </summary>
          <pre className="mt-4 bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-96">
            {JSON.stringify(dpt, null, 2)}
          </pre>
        </details>

        {/* ── Improvement request form ── */}
        {showImprovementForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-2 border-orange-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              💬 Solicitar Melhoria na Extração
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              Descreva o que está incorreto ou incompleto. Esta informação será usada para
              re-processar a entrevista com instruções adicionais.
            </p>
            <textarea
              value={improvementNote}
              onChange={(e) => setImprovementNote(e.target.value)}
              placeholder="Ex: As etapas do processo estão incompletas. Faltam os responsáveis de cada etapa..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 mb-3"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Future: re-call /api/dpt with edit_instructions
                  setShowImprovementForm(false);
                  setImprovementNote('');
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
              >
                Enviar Solicitação
              </button>
              <button
                onClick={() => setShowImprovementForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setApproved(true)}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                approved
                  ? 'bg-green-600 text-white cursor-default'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
              }`}
            >
              {approved ? '✅ Aprovada' : '✅ Aprovar DPT'}
            </button>
            <button
              onClick={() => {
                setApproved(false);
                // Scroll to first section
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              className="px-5 py-2.5 bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300 rounded-lg font-medium text-sm transition-colors"
            >
              ✏️ Editar Campos
            </button>
            <button
              onClick={() => setShowImprovementForm(!showImprovementForm)}
              className="px-5 py-2.5 bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300 rounded-lg font-medium text-sm transition-colors"
            >
              💬 Solicitar Melhoria
            </button>
          </div>
        </div>

        {/* ── Navigation ── */}
        <div className="flex justify-between gap-4">
          <button
            onClick={onPrevious}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ← Anterior
          </button>
          <button
            onClick={onNext}
            disabled={!approved}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Prosseguir →
          </button>
        </div>

        {!approved && (
          <p className="text-center text-gray-500 text-sm mt-3">
            Aprove a DPT para continuar para a próxima etapa
          </p>
        )}
      </div>
    </div>
  );
}
