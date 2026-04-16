// Placeholder: MelhoriaPage
export default function MelhoriaPage({ onNext, onPrev }) {
  return (
    <div className="page">
      <h2>MelhoriaPage</h2>
      <p>TODO: Implementar conteúdo</p>
      {onPrev && <button onClick={onPrev}>← Voltar</button>}
      {onNext && <button onClick={() => onNext({})}>Próxima →</button>}
    </div>
  )
}
