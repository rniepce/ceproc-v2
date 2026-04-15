// Placeholder: IndicadoresPage
export default function IndicadoresPage({ onNext, onPrev }) {
  return (
    <div className="page">
      <h2>IndicadoresPage</h2>
      <p>TODO: Implementar conteúdo</p>
      {onPrev && <button onClick={onPrev}>← Voltar</button>}
      {onNext && <button onClick={() => onNext({})}>Próxima →</button>}
    </div>
  )
}
