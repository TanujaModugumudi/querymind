export default function ResultTable({ data, columns }) {
  if (!data || data.length === 0) {
    return <div style={s.empty}>No results returned for this query.</div>
  }

  return (
    <div style={s.wrapper} className="fade-up">
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.dot}/>
          <span style={s.label}>Results</span>
        </div>
        <span style={s.count}>{data.length} row{data.length !== 1 ? 's' : ''}</span>
      </div>
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col} style={s.th}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={s.tr}>
                {columns.map(col => (
                  <td key={col} style={s.td}>
                    {row[col] === null
                      ? <span style={s.null}>null</span>
                      : String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const s = {
  wrapper: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px', overflow: 'hidden',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 16px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-elevated)',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  dot: {
    width: '6px', height: '6px', borderRadius: '50%',
    background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)',
    display: 'inline-block',
  },
  label: { color: 'var(--accent)', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' },
  count: {
    fontSize: '11px', color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    background: 'var(--bg-hover)', padding: '2px 10px', borderRadius: '20px',
  },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: {
    padding: '10px 16px', textAlign: 'left',
    color: 'var(--text-secondary)', fontWeight: '700',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-elevated)',
    fontSize: '11px', letterSpacing: '0.8px', textTransform: 'uppercase',
    whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)',
  },
  tr: {
    borderBottom: '1px solid var(--border)',
    transition: 'background 0.1s',
  },
  td: {
    padding: '11px 16px',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-mono)', fontSize: '13px',
  },
  null: { color: 'var(--text-muted)', fontStyle: 'italic' },
  empty: {
    padding: '2.5rem', textAlign: 'center',
    color: 'var(--text-muted)', background: 'var(--bg-surface)',
    borderRadius: '12px', border: '1px solid var(--border)',
    fontSize: '14px',
  },
}