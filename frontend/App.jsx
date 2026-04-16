import { useState } from 'react'
import EntradaPage from './pages/1-EntradaPage'
import AnalysisPage from './pages/2-AnalysisPage'
import BPMNPage from './pages/3-BPMNPage'
import KPIPage from './pages/4-KPIPage'
import GargalosPage from './pages/5-GargalosPage'
import ReviewPage from './pages/6-ReviewPage'
import ExportPage from './pages/7-ExportPage'
import DashboardPage from './pages/8-DashboardPage'

/**
 * App - Main wizard orchestrator
 * Manages the 8-step wizard flow for CEPROC V2 process analysis
 * Uses custom React hooks for state management (useAPI, useDPT, useBPMN, useKPI, useExport)
 */
export default function App() {
  const [currentStep, setCurrentStep] = useState(0)

  const pages = [
    { title: 'Entrada', component: EntradaPage, icon: '📝' },
    { title: 'Análise', component: AnalysisPage, icon: '📊' },
    { title: 'BPMN', component: BPMNPage, icon: '📐' },
    { title: 'Indicadores', component: KPIPage, icon: '📈' },
    { title: 'Gargalos', component: GargalosPage, icon: '🎯' },
    { title: 'Revisão', component: ReviewPage, icon: '📋' },
    { title: 'Exportação', component: ExportPage, icon: '📦' },
    { title: 'Dashboard', component: DashboardPage, icon: '✅' },
  ]

  const CurrentPage = pages[currentStep].component

  const handleNext = () => {
    if (currentStep < pages.length - 1) {
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
    setCurrentStep(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Progress */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                🔄 CEPROC V2 - Análise de Processos
              </h1>
              <p className="text-gray-600 text-sm">
                Etapa {currentStep + 1}/8 - {pages[currentStep].title}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Progresso</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(((currentStep + 1) / pages.length) * 100)}%
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / pages.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="bg-gray-50 px-6 py-3 max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {pages.map((page, idx) => (
              <button
                key={idx}
                onClick={() => idx <= currentStep && setCurrentStep(idx)}
                disabled={idx > currentStep}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  idx < currentStep
                    ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600'
                    : idx === currentStep
                    ? 'bg-blue-500 text-white cursor-default'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}
              >
                {idx < currentStep ? '✓' : idx === currentStep ? '●' : '○'} {page.title}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen">
        {currentStep === pages.length - 1 ? (
          <DashboardPage onRestart={handleRestart} />
        ) : (
          <CurrentPage onNext={handleNext} onPrevious={handlePrevious} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="mb-2">
            🚀 CEPROC V2 - Plataforma de Análise Inteligente de Processos
          </p>
          <p className="text-gray-400 text-sm">
            Powered by Azure OpenAI | FastAPI Backend | React Frontend | Railway Deployment
          </p>
        </div>
      </footer>
    </div>
  )
}
