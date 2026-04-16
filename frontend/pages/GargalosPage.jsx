// Placeholder: GargalosPage
export default function GargalosPage({ onNext, onPrev }) {
  return (
    <div className="page">
      <h2>GargalosPage</h2>
      <p>TODO: Implementar conteúdo</p>
      {onPrev && <button onClick={onPrev}>← Voltar</button>}
      {onNext && <button onClick={() => onNext({})}>Próxima →</button>}
    </div>
  )
}
