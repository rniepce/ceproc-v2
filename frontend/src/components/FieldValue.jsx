/**
 * FieldValue – Shared component for safely rendering any DPT field value.
 *
 * The backend can return several different shapes for a single DPT field:
 *   • null / undefined
 *   • Primitive  (string, number, boolean)
 *   • Array of strings
 *   • Array of objects  (with etapa, descricao, termo, nome properties)
 *   • SessaoComLista    ({ descricao, lista }) — must be caught before the
 *     generic object branch so the object is never passed directly to JSX
 *     (which would trigger React error #31)
 *   • Nested SessaoComLista inside an array
 *   • Plain object      (rendered as formatted JSON)
 *
 * Type-checking order matters: the `lista` guard runs before the generic
 * Array and plain-object branches, and always includes `!Array.isArray(value)`
 * so arrays are never mistakenly treated as SessaoComLista objects.
 */
export default function FieldValue({ value }) {
  // ── null / undefined ──────────────────────────────────────────────────────
  if (value === null || value === undefined) {
    return <span className="text-gray-400 italic">—</span>;
  }

  // ── SessaoComLista: { descricao?, lista } ─────────────────────────────────
  // Must be checked before the generic Array and plain-object branches so the
  // object is never passed directly to JSX (React error #31).
  if (
    typeof value === 'object' &&
    !Array.isArray(value) &&
    value.lista !== undefined
  ) {
    const items = Array.isArray(value.lista) ? value.lista : [];
    return (
      <div>
        {value.descricao && (
          <p className="text-gray-600 text-sm mb-2 italic">
            {String(value.descricao)}
          </p>
        )}
        {items.length === 0 ? (
          <span className="text-gray-400 italic">—</span>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {items.map((item, i) => (
              <li key={i} className="text-gray-700 text-sm">
                {typeof item === 'object' ? JSON.stringify(item) : String(item)}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // ── Array of strings or objects ───────────────────────────────────────────
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-gray-400 italic">—</span>;
    }
    return (
      <ul className="list-disc list-inside space-y-1">
        {value.map((item, i) => {
          if (item === null || item === undefined) {
            return (
              <li key={i} className="text-gray-700 text-sm">
                —
              </li>
            );
          }

          // Nested SessaoComLista inside an array
          if (typeof item === 'object' && !Array.isArray(item) && item.lista !== undefined) {
            const subItems = Array.isArray(item.lista) ? item.lista : [];
            return (
              <li key={i} className="text-gray-700 text-sm">
                {item.descricao ? (
                  <span className="italic text-gray-600">
                    {String(item.descricao)}:{' '}
                  </span>
                ) : null}
                {subItems.length > 0
                  ? subItems
                      .map((s) =>
                        typeof s === 'object' ? JSON.stringify(s) : String(s)
                      )
                      .join(', ')
                  : '—'}
              </li>
            );
          }

          // Generic object — extract a readable string property or fall back to JSON
          if (typeof item === 'object') {
            const label =
              item.etapa ?? item.descricao ?? item.termo ?? item.nome ?? null;
            return (
              <li key={i} className="text-gray-700 text-sm">
                {label !== null && typeof label !== 'object'
                  ? String(label)
                  : JSON.stringify(item)}
              </li>
            );
          }

          return (
            <li key={i} className="text-gray-700 text-sm">
              {String(item)}
            </li>
          );
        })}
      </ul>
    );
  }

  // ── Plain object — render as formatted JSON ───────────────────────────────
  if (typeof value === 'object') {
    return (
      <pre className="text-xs text-gray-700 bg-gray-50 rounded p-2 overflow-x-auto">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  // ── Primitive (string, number, boolean) ───────────────────────────────────
  return <span className="text-gray-700 text-sm">{String(value)}</span>;
}
