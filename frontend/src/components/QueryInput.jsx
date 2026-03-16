import { useState } from 'react'

export default function QueryInput({ onSubmit, loading, connections, selectedConn, onConnChange }) {
  const [question, setQuestion] = useState('')

  const handleSubmit = () => {
    if (!question.trim() || !selectedConn) return
    onSubmit(question)
    setQuestion('')
  }

  return (
    <div style={s.wrapper}>
      <div style={s.topRow}>
        <div style={s.selectWrap}>
          <span style={s.selectIcon}>⬡</span>
          <select style={s.select} value={selectedConn || ''} onChange={e => onConnChange(e.target.value)}>
            <option value="">Select database...</option>
            {connections.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        {selectedConn && <span style={s.connectedBadge}>● Connected</span>}
      </div>

      <div style={s.inputRow}>
        <div style={s.inputWrap}>
          <span style={s.inputIcon}>▸</span>
          <input
            style={s.input}
            placeholder="Ask anything in plain English..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            disabled={loading}
          />
        </div>
        <button
          style={loading || !selectedConn ? s.btnDisabled : s.btn}
          onClick={handleSubmit}
          disabled={loading || !selectedConn}
        >
          {loading ? (
            <span style={s.loadingText}>
              <span style={s.spinner}/> Running
            </span>
          ) : 'Run →'}
        </button>
      </div>

      {!selectedConn && (
        <p style={s.hint}>← Select a database connection to begin</p>
      )}
    </div>
  )
}

const s = {
  wrapper: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px', padding: '1.25rem',
    display: 'flex', flexDirection: 'column', gap: '12px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  },
  topRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  selectWrap: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)', borderRadius: '8px',
    padding: '0 12px', flex: 1, maxWidth: '260px',
  },
  selectIcon: { color: 'var(--accent)', fontSize: '14px' },
  select: {
    flex: 1, padding: '10px 0',
    background: 'transparent', border: 'none',
    color: 'var(--text-primary)', fontSize: '13px',
    cursor: 'pointer', fontFamily: 'var(--font-display)',
    outline: 'none',
  },
  connectedBadge: {
    fontSize: '11px', color: 'var(--green)',
    fontWeight: '700', letterSpacing: '0.5px',
  },
  inputRow: { display: 'flex', gap: '10px' },
  inputWrap: {
    flex: 1, display: 'flex', alignItems: 'center',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)', borderRadius: '10px',
    padding: '0 14px', gap: '10px',
    transition: 'border-color 0.2s',
  },
  inputIcon: { color: 'var(--accent)', fontSize: '16px', flexShrink: 0 },
  input: {
    flex: 1, padding: '13px 0',
    background: 'transparent', border: 'none',
    color: 'var(--text-primary)', fontSize: '14px',
    fontFamily: 'var(--font-display)',
    outline: 'none',
  },
  btn: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)',
    color: 'var(--bg-base)', border: 'none', borderRadius: '10px',
    cursor: 'pointer', fontWeight: '800', fontSize: '14px',
    fontFamily: 'var(--font-display)', whiteSpace: 'nowrap',
    boxShadow: '0 4px 16px var(--accent-glow)',
    letterSpacing: '0.5px',
  },
  btnDisabled: {
    padding: '12px 28px',
    background: 'var(--bg-elevated)',
    color: 'var(--text-muted)', border: '1px solid var(--border)',
    borderRadius: '10px', cursor: 'not-allowed',
    fontWeight: '700', fontSize: '14px',
    fontFamily: 'var(--font-display)', whiteSpace: 'nowrap',
  },
  loadingText: { display: 'flex', alignItems: 'center', gap: '8px' },
  spinner: {
    width: '12px', height: '12px', borderRadius: '50%',
    border: '2px solid var(--bg-base)',
    borderTopColor: 'transparent',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
  hint: { color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' },
}