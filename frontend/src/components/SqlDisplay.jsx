import { useState } from 'react'

export default function SqlDisplay({ sql, explanation }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(sql)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!sql) return null

  return (
    <div style={s.wrapper} className="fade-up">
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.dot}/>
          <span style={s.label}>Generated SQL</span>
        </div>
        <button style={copied ? s.copiedBtn : s.copyBtn} onClick={handleCopy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre style={s.code}>{sql}</pre>
      {explanation && (
        <div style={s.explanation}>
          <span style={s.explainBadge}>AI</span>
          <span style={s.explainText}>{explanation}</span>
        </div>
      )}
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
    background: 'var(--green)', boxShadow: '0 0 6px var(--green)',
    display: 'inline-block',
  },
  label: { color: 'var(--accent)', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' },
  copyBtn: {
    padding: '4px 12px', background: 'transparent',
    border: '1px solid var(--border)', borderRadius: '6px',
    color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px',
    fontFamily: 'var(--font-display)',
  },
  copiedBtn: {
    padding: '4px 12px',
    background: 'rgba(0,229,160,0.1)',
    border: '1px solid var(--green)', borderRadius: '6px',
    color: 'var(--green)', cursor: 'pointer', fontSize: '12px',
    fontFamily: 'var(--font-display)',
  },
  code: {
    padding: '1.25rem 1.5rem',
    color: '#a8d8ff',
    fontSize: '13px', fontFamily: 'var(--font-mono)',
    overflowX: 'auto', margin: 0, lineHeight: 1.8,
    whiteSpace: 'pre-wrap',
    background: '#080e1a',
  },
  explanation: {
    padding: '12px 16px',
    borderTop: '1px solid var(--border)',
    display: 'flex', gap: '10px', alignItems: 'flex-start',
    background: 'var(--accent-2-glow)',
  },
  explainBadge: {
    fontSize: '10px', fontWeight: '800', padding: '2px 7px',
    borderRadius: '4px', background: 'var(--accent-2)',
    color: 'white', flexShrink: 0, letterSpacing: '1px',
    marginTop: '1px',
  },
  explainText: { color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 },
}