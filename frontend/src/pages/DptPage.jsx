// Placeholder: DptPage
export default function DptPage({ onNext, onPrev }) {
  return (
    <div className="page">
      <h2>DptPage</h2>
      <p>TODO: Implementar conteúdo</p>
      {onPrev && <button onClick={onPrev}>← Voltar</button>}
      {onNext && <button onClick={() => onNext({})}>Próxima →</button>}
    </div>
  )
}
