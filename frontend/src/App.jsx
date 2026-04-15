import { useState } from 'react'
import Header from './components/Header'
import Stepper from './components/Stepper'

// Import pages
import EntradaPage from './pages/EntradaPage'
import AnalisePage from './pages/AnalisePage'
import DptPage from './pages/DptPage'
import IndicadoresPage from './pages/IndicadoresPage'
import BpmnPage from './pages/BpmnPage'
import GargalosPage from './pages/GargalosPage'
import MelhoriaPage from './pages/MelhoriaPage'
import DashboardPage from './pages/DashboardPage'

/**
 * CEPROC V2 — Aplicação Principal
 * Fluxo de 8 etapas para mapeamento inteligente de processos
 */
export default function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [processData, setProcessData] = useState({
    transcription: '',
    dpt_json: null,
    bpmn_json: null,
    bpmn_xml: null,
    kpis: [],
    gargalos: {},
    melhorias_aprovadas: [],
    iteracoes: []
  })

  const steps = [
    { number: 1, label: 'Entrada', icon: '📥' },
    { number: 2, label: 'Análise', icon: '🔍' },
    { number: 3, label: 'DPT', icon: '📋' },
    { number: 4, label: 'Indicadores', icon: '📈' },
    { number: 5, label: 'BPMN', icon: '📊' },
    { number: 6, label: 'Gargalos', icon: '⚠️' },
    { number: 7, label: 'Melhoria', icon: '⚡' },
    { number: 8, label: 'Dashboard', icon: '🎯' }
  ]

  const handleStepChange = (step) => {
    setCurrentStep(step)
  }

  const handleDataUpdate = (key, value) => {
    setProcessData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const renderPage = () => {
    switch (currentStep) {
      case 1:
        return (
          <EntradaPage
            data={processData}
            onNext={(transcription) => {
              handleDataUpdate('transcription', transcription)
              handleStepChange(2)
            }}
          />
        )
      case 2:
        return (
          <AnalisePage
            transcription={processData.transcription}
            onNext={(dpt_json) => {
              handleDataUpdate('dpt_json', dpt_json)
              handleStepChange(3)
            }}
            onPrev={() => handleStepChange(1)}
          />
        )
      case 3:
        return (
          <DptPage
            dpt_json={processData.dpt_json}
            onNext={(dpt_json) => {
              handleDataUpdate('dpt_json', dpt_json)
              handleStepChange(4)
            }}
            onPrev={() => handleStepChange(2)}
          />
        )
      case 4:
        return (
          <IndicadoresPage
            dpt_json={processData.dpt_json}
            kpis={processData.kpis}
            onNext={(kpis) => {
              handleDataUpdate('kpis', kpis)
              handleStepChange(5)
            }}
            onPrev={() => handleStepChange(3)}
          />
        )
      case 5:
        return (
          <BpmnPage
            dpt_json={processData.dpt_json}
            bpmn_json={processData.bpmn_json}
            onNext={(bpmn_json, bpmn_xml) => {
              handleDataUpdate('bpmn_json', bpmn_json)
              handleDataUpdate('bpmn_xml', bpmn_xml)
              handleStepChange(6)
            }}
            onPrev={() => handleStepChange(4)}
          />
        )
      case 6:
        return (
          <GargalosPage
            dpt_json={processData.dpt_json}
            bpmn_json={processData.bpmn_json}
            onNext={(gargalos) => {
              handleDataUpdate('gargalos', gargalos)
              handleStepChange(7)
            }}
            onPrev={() => handleStepChange(5)}
          />
        )
      case 7:
        return (
          <MelhoriaPage
            gargalos={processData.gargalos}
            onNext={(melhorias) => {
              handleDataUpdate('melhorias_aprovadas', melhorias)
              handleStepChange(8)
            }}
            onPrev={() => handleStepChange(6)}
          />
        )
      case 8:
        return (
          <DashboardPage
            data={processData}
            onRestart={() => {
              setProcessData({
                transcription: '',
                dpt_json: null,
                bpmn_json: null,
                bpmn_xml: null,
                kpis: [],
                gargalos: {},
                melhorias_aprovadas: [],
                iteracoes: []
              })
              handleStepChange(1)
            }}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="app">
      <Header />
      <Stepper steps={steps} currentStep={currentStep} onStepClick={handleStepChange} />
      <main className="app-main">
        {renderPage()}
      </main>
    </div>
  )
}
