// Placeholder: Etapa 1 - Entrada (Áudio ou Texto)
export default function EntradaPage({ onNext }) {
  return (
    <div className="page">
      <h2>Etapa 1/8: Captura de Entrevista</h2>
      <p>TODO: Implementar upload de áudio e textarea para texto</p>
      <button onClick={() => onNext("Texto de exemplo")}>Próxima →</button>
    </div>
  )
}
