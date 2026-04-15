// Placeholder: AnalisePage
export default function AnalisePage({ onNext, onPrev }) {
  return (
    <div className="page">
      <h2>AnalisePage</h2>
      <p>TODO: Implementar conteúdo</p>
      {onPrev && <button onClick={onPrev}>← Voltar</button>}
      {onNext && <button onClick={() => onNext({})}>Próxima →</button>}
    </div>
  )
}
