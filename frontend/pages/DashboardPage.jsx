// Placeholder: DashboardPage
export default function DashboardPage({ onNext, onPrev }) {
  return (
    <div className="page">
      <h2>DashboardPage</h2>
      <p>TODO: Implementar conteúdo</p>
      {onPrev && <button onClick={onPrev}>← Voltar</button>}
      {onNext && <button onClick={() => onNext({})}>Próxima →</button>}
    </div>
  )
}
