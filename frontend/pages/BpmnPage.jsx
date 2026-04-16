// Placeholder: BpmnPage
export default function BpmnPage({ onNext, onPrev }) {
  return (
    <div className="page">
      <h2>BpmnPage</h2>
      <p>TODO: Implementar conteúdo</p>
      {onPrev && <button onClick={onPrev}>← Voltar</button>}
      {onNext && <button onClick={() => onNext({})}>Próxima →</button>}
    </div>
  )
}
