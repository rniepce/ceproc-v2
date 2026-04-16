import { useState } from 'react'
import { useWorkflow } from './hooks'
import EntradaPage from './pages/EntradaPage'
import DptPage from './pages/DptPage'
import AnalysisPage from './pages/2-AnalysisPage'
import BPMNPage from './pages/3-BPMNPage'
import KPIPage from './pages/4-KPIPage'
import GargalosPage from './pages/5-GargalosPage'
import ReviewPage from './pages/6-ReviewPage'
import ExportPage from './pages/7-ExportPage'
import DashboardPage from './pages/8-DashboardPage'

/**
 * App – Main wizard orchestrator for CEPROC V2.
 *
 * Manages the 8-step wizard flow and owns the shared `workflow` state object
 * (via useWorkflow) that is passed as a prop to every page.  This ensures all
 * steps share a single source of truth without relying on individual hooks
 * that each maintain their own isolated state.
 *
 * Step map:
 *   0 – Entrada    (interview text + metadata → calls /api/dpt)
 *   1 – DPT        (review / edit / approve extracted DPT)
 *   2 – Análise    (detailed DPT field review)
 *   3 – BPMN       (generate & view BPMN diagram)
 *   4 – Indicadores (KPI table)
 *   5 – Gargalos   (bottleneck analysis)
 *   6 – Revisão    (full review before export)
 *   7 – Exportação (download DOCX / XLSX / BPMN / ZIP)
 *   8 – Dashboard  (completion summary)
 */
export default function App() {
  const [currentStep, setCurrentStep] = useState(0)
  const workflow = useWorkflow()

  const pages = [
    { title: 'Entrada',     component: EntradaPage,   icon: '📝' },
    { title: 'DPT',         component: DptPage,       icon: '📄' },
    { title: 'Análise',     component: AnalysisPage,  icon: '📊' },
    { title: 'BPMN',        component: BPMNPage,      icon: '📐' },
    { title: 'Indicadores', component: KPIPage,       icon: '📈' },
    { title: 'Gargalos',    component: GargalosPage,  icon: '🎯' },
    { title: 'Revisão',     component: ReviewPage,    icon: '📋' },
    { title: 'Exportação',  component: ExportPage,    icon: '📦' },
    { title: 'Dashboard',   component: DashboardPage, icon: '✅' },
  ]

  const totalSteps = pages.length

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleRestart = () => {
    workflow.resetWorkflow()
    setCurrentStep(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const CurrentPage = pages[currentStep].component

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ── Header with progress ── */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                🔄 CEPROC V2 — Análise de Processos
              </h1>
              <p className="text-gray-600 text-sm">
                Etapa {currentStep + 1}/{totalSteps} — {pages[currentStep].title}
                {workflow.entrada.metadata.processo && (
                  <span className="ml-2 text-blue-600 font-medium">
                    · {workflow.entrada.metadata.processo}
                  </span>
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-xs">Progresso</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(((currentStep + 1) / totalSteps) * 100)}%
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="bg-gray-50 px-6 py-3 max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {pages.map((page, idx) => (
              <button
                key={idx}
                onClick={() => idx < currentStep && setCurrentStep(idx)}
                disabled={idx > currentStep}
                title={page.title}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  idx < currentStep
                    ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600'
                    : idx === currentStep
                    ? 'bg-blue-500 text-white cursor-default'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {page.icon}{' '}
                {idx < currentStep ? '✓' : idx === currentStep ? '●' : '○'}{' '}
                {page.title}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="min-h-screen">
        {currentStep === totalSteps - 1 ? (
          <DashboardPage onRestart={handleRestart} workflow={workflow} />
        ) : (
          <CurrentPage
            onNext={handleNext}
            onPrevious={handlePrevious}
            workflow={workflow}
          />
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="mb-2">
            🚀 CEPROC V2 — Plataforma de Análise Inteligente de Processos
          </p>
          <p className="text-gray-400 text-sm">
            Powered by Azure OpenAI · FastAPI Backend · React Frontend · Railway
          </p>
        </div>
      </footer>
    </div>
  )
}
