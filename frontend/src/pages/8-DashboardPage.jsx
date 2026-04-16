import FieldValue from '../components/FieldValue';

/**
 * Página 8: FINALIZAÇÃO - Dashboard de resultados e conclusão
 * Exibe um resumo executivo dos resultados da análise
 * Opções para nova análise ou compartilhamento
 *
 * Receives `workflow` prop from App.jsx for shared state access.
 */
export default function DashboardPage({ onRestart, workflow }) {
  const dpt = workflow?.dpt ?? null;
  const metadata = workflow?.entrada?.metadata ?? {};
  const bpmn = workflow?.bpmn ?? null;
  const kpis = workflow?.kpis ?? [];

  const kpiStats = {
    total: kpis.length,
    completionPercentage: 0,
    byCriticality: {},
  };

  const handleNewAnalysis = () => {
    onRestart();
  };

  const completionPercentage = Math.min(
    (dpt && bpmn && kpis.length > 0 ? 100 : dpt && kpis.length > 0 ? 66 : dpt ? 33 : 0)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Success Banner */}
        <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-2xl shadow-xl p-8 mb-8 text-center">
          <p className="text-6xl mb-4">🎉</p>
          <h1 className="text-4xl font-bold mb-2">Análise Completa!</h1>
          <p className="text-lg opacity-90">
            Sua análise de processo foi realizada com sucesso
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Process Overview */}
          <div className="lg:col-span-2">
            {/* Process Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {dpt?.nome_processo || 'Processo Analisado'}
              </h2>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <InfoBlock
                  label="Analista"
                  value={metadata.analista || '—'}
                  icon="👤"
                />
                <InfoBlock
                  label="Departamento"
                  value={metadata.departamento || '—'}
                  icon="🏢"
                />
                <InfoBlock
                  label="Data"
                  value={
                    metadata.data
                      ? new Date(metadata.data).toLocaleDateString('pt-BR')
                      : '—'
                  }
                  icon="📅"
                />
                <InfoBlock
                  label="Status"
                  value="✅ Concluído"
                  icon="✅"
                />
              </div>

              {dpt?.descricao && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2">📋 Descrição</h3>
                  <div className="text-gray-700 whitespace-pre-wrap text-sm">
                    <FieldValue value={dpt.descricao} />
                  </div>
                </div>
              )}
            </div>

            {/* Statistics Grid */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 Estatísticas da Análise</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  label="Etapas"
                  value={dpt?.etapas?.length || 0}
                  icon="🔄"
                  color="blue"
                />
                <StatCard
                  label="Atores"
                  value={dpt?.atores?.length || 0}
                  icon="👥"
                  color="green"
                />
                <StatCard
                  label="Sistemas"
                  value={dpt?.sistemas?.length || 0}
                  icon="🖥️"
                  color="purple"
                />
                <StatCard
                  label="KPIs"
                  value={kpis?.length || 0}
                  icon="📈"
                  color="orange"
                />

                {bpmn && (
                  <>
                    <StatCard
                      label="Atividades BPMN"
                      value={bpmn.activities?.length || 0}
                      icon="📐"
                      color="pink"
                    />
                    <StatCard
                      label="Gateways"
                      value={bpmn.gateways?.length || 0}
                      icon="⬬"
                      color="indigo"
                    />
                    <StatCard
                      label="Fluxos"
                      value={bpmn.sequenceFlows?.length || 0}
                      icon="➜"
                      color="cyan"
                    />
                    <StatCard
                      label="Pools"
                      value={bpmn.pools?.length || 0}
                      icon="📦"
                      color="teal"
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-6">
            {/* Completion Progress */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-bold text-gray-800 mb-4">📊 Completude da Análise</h3>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Progresso Geral</span>
                  <span className="font-bold text-blue-600">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <CheckItem completed={!!dpt}>Descrição do Processo (DPT)</CheckItem>
                <CheckItem completed={!!bpmn}>Diagrama BPMN</CheckItem>
                <CheckItem completed={kpis.length > 0}>Indicadores (KPIs)</CheckItem>
                <CheckItem completed={true}>Análise de Gargalos</CheckItem>
                <CheckItem completed={true}>Exportação de Dados</CheckItem>
              </div>
            </div>

            {/* KPI Summary */}
            {kpis.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="font-bold text-gray-800 mb-4">📈 Resumo de KPIs</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Total Gerado</span>
                    <span className="font-bold text-blue-600">{kpiStats.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Completude</span>
                    <span className="font-bold text-green-600">
                      {kpiStats.completionPercentage || 0}%
                    </span>
                  </div>
                  {kpiStats.byCriticality?.alta > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Alta Criticidade</span>
                      <span className="font-bold text-red-600">
                        {kpiStats.byCriticality.alta}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-3">
              <h3 className="font-bold text-gray-800 mb-4">🎯 Próximas Ações</h3>
              <ActionButton
                label="📊 Nova Análise"
                description="Iniciar análise de outro processo"
                onClick={handleNewAnalysis}
                color="blue"
              />
              <ActionButton
                label="📥 Baixar Resultados"
                description="Acessar página de exportação"
                disabled
                color="green"
              />
              <ActionButton
                label="📧 Compartilhar"
                description="Enviar relatório via email"
                disabled
                color="purple"
              />
            </div>

            {/* Contact Info */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 border border-blue-200">
              <p className="text-sm text-gray-700">
                <strong>💡 Dica:</strong> Salve todos os arquivos exportados para futuras
                referências e acompanhamento de melhorias implementadas.
              </p>
            </div>
          </div>
        </div>

        {/* Process Flow Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">✅ Etapas Concluídas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ProcessStep step="1" title="Entrada" completed icon="📝" />
            <ProcessStep step="2" title="Análise DPT" completed icon="📊" />
            <ProcessStep step="3" title="BPMN" completed={!!bpmn} icon="📐" />
            <ProcessStep step="4" title="KPIs" completed={kpis.length > 0} icon="📈" />
            <ProcessStep step="5" title="Gargalos" completed icon="🎯" />
            <ProcessStep step="6" title="Revisão" completed icon="📋" />
            <ProcessStep step="7" title="Exportação" completed icon="📦" />
            <ProcessStep step="8" title="Dashboard" completed icon="✅" />
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-xl p-8 border border-green-200 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">🌟 Benefícios da Análise</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BenefitItem
              icon="⚡"
              title="Otimização de Processos"
              description="Identificação clara de gargalos e ineficiências"
            />
            <BenefitItem
              icon="📈"
              title="Melhoria de Performance"
              description="KPIs estruturados para acompanhamento contínuo"
            />
            <BenefitItem
              icon="💰"
              title="Redução de Custos"
              description="Eliminar processos manuais desnecessários"
            />
            <BenefitItem
              icon="👥"
              title="Alinhamento de Times"
              description="Documentação clara de responsabilidades"
            />
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="text-center">
          <button
            onClick={handleNewAnalysis}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 shadow-lg transition-colors"
          >
            🔄 Analisar Outro Processo
          </button>
          <p className="text-gray-600 mt-6">
            Plataforma CEPROC V2 - Análise Inteligente de Processos com Azure OpenAI
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente: Bloco de Informação
 */
function InfoBlock({ label, value, icon }) {
  return (
    <div>
      <p className="text-gray-600 text-sm mb-1">{icon} {label}</p>
      <p className="text-xl font-semibold text-gray-800">{value}</p>
    </div>
  );
}

/**
 * Componente: Cartão de Estatística
 */
function StatCard({ label, value, icon, color }) {
  const colorMap = {
    blue: 'from-blue-400 to-blue-600',
    green: 'from-green-400 to-green-600',
    purple: 'from-purple-400 to-purple-600',
    orange: 'from-orange-400 to-orange-600',
    pink: 'from-pink-400 to-pink-600',
    indigo: 'from-indigo-400 to-indigo-600',
    cyan: 'from-cyan-400 to-cyan-600',
    teal: 'from-teal-400 to-teal-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} rounded-xl p-4 text-white text-center shadow-lg`}>
      <p className="text-3xl mb-1">{icon}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-90">{label}</p>
    </div>
  );
}

/**
 * Componente: Item de Verificação
 */
function CheckItem({ completed, children }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded">
      <span className={completed ? '✅' : '⏳'}>
        {completed ? '✅' : '⏳'}
      </span>
      <span className={completed ? 'text-green-700 font-medium' : 'text-gray-600'}>
        {children}
      </span>
    </div>
  );
}

/**
 * Componente: Botão de Ação
 */
function ActionButton({ label, description, onClick, disabled = false, color = 'blue' }) {
  const colorMap = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
    green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
    purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full p-3 rounded-lg border-2 text-left font-medium transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : colorMap[color]
      }`}
    >
      <p className="font-bold">{label}</p>
      <p className="text-xs opacity-75">{description}</p>
    </button>
  );
}

/**
 * Componente: Passo do Processo
 */
function ProcessStep({ step, title, completed, icon }) {
  return (
    <div
      className={`p-4 rounded-lg border-2 text-center transition-all ${
        completed
          ? 'bg-green-50 border-green-300 text-green-700'
          : 'bg-gray-50 border-gray-200 text-gray-600'
      }`}
    >
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-xs text-gray-500">Passo {step}</p>
      <p className="font-semibold text-sm">{title}</p>
      {completed && <p className="text-xs mt-1">✅ Concluído</p>}
    </div>
  );
}

/**
 * Componente: Item de Benefício
 */
function BenefitItem({ icon, title, description }) {
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <p className="text-3xl mb-2">{icon}</p>
      <h4 className="font-bold text-gray-800 mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
