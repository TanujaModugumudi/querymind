import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser, getMe } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    try {
      if (isRegister) await registerUser({ email, password, name })
      const res   = await loginUser(email, password)
      const token = res.data.access_token
      localStorage.setItem('token', token)
      const meRes = await getMe()
      login(token, meRes.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div style={s.page}>
      <div style={s.grid}/>
      <div style={s.card}>
        <div style={s.logoRow}>
          <div style={s.logoDot}/>
          <span style={s.logoText}>QueryMind</span>
        </div>
        <p style={s.tagline}>Ask your database anything.</p>
        <p style={s.subTagline}>Natural language → SQL → Results → Charts</p>

        <div style={s.tabs}>
          {['Login', 'Register'].map((tab, i) => (
            <button
              key={tab}
              style={isRegister === !!i ? s.tabActive : s.tabInactive}
              onClick={() => setIsRegister(!!i)}
            >{tab}</button>
          ))}
        </div>

        <div style={s.fields}>
          {isRegister && (
            <div style={s.fieldWrap}>
              <label style={s.label}>Name</label>
              <input style={s.input} placeholder="Your name"
                value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div style={s.fieldWrap}>
            <label style={s.label}>Email</label>
            <input style={s.input} placeholder="you@example.com" type="email"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div style={s.fieldWrap}>
            <label style={s.label}>Password</label>
            <input style={s.input} placeholder="••••••••" type="password"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <button style={loading ? s.btnDisabled : s.btn}
          onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait...' : isRegister ? 'Create Account →' : 'Login →'}
        </button>

        <p style={s.footer}>
          AI-powered SQL generation · Built with FastAPI + React
        </p>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-base)', position: 'relative', overflow: 'hidden',
  },
  grid: {
    position: 'absolute', inset: 0,
    backgroundImage: `
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    opacity: 0.4,
  },
  card: {
    position: 'relative', zIndex: 1,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '16px', padding: '2.5rem',
    width: '100%', maxWidth: '420px',
    display: 'flex', flexDirection: 'column', gap: '1.1rem',
    boxShadow: '0 0 60px rgba(0,212,255,0.06), 0 24px 48px rgba(0,0,0,0.4)',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' },
  logoDot: {
    width: '10px', height: '10px', borderRadius: '50%',
    background: 'var(--accent)', boxShadow: '0 0 12px var(--accent)',
  },
  logoText: { fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px' },
  tagline: { textAlign: 'center', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '-4px' },
  subTagline: {
    textAlign: 'center', fontSize: '12px',
    color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
    marginTop: '-8px',
  },
  tabs: { display: 'flex', gap: '6px', background: 'var(--bg-elevated)', padding: '4px', borderRadius: '10px' },
  tabActive: {
    flex: 1, padding: '8px', background: 'var(--accent)',
    color: 'var(--bg-base)', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: '700', fontSize: '13px',
    fontFamily: 'var(--font-display)',
  },
  tabInactive: {
    flex: 1, padding: '8px', background: 'transparent',
    color: 'var(--text-muted)', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
    fontFamily: 'var(--font-display)',
  },
  fields: { display: 'flex', flexDirection: 'column', gap: '10px' },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase' },
  input: {
    padding: '11px 14px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '8px', color: 'var(--text-primary)',
    fontSize: '14px', fontFamily: 'var(--font-mono)',
    width: '100%',
  },
  error: {
    background: 'rgba(255,77,106,0.1)', border: '1px solid var(--red)',
    color: 'var(--red)', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', textAlign: 'center',
  },
  btn: {
    padding: '13px',
    background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)',
    color: 'var(--bg-base)', border: 'none', borderRadius: '10px',
    cursor: 'pointer', fontWeight: '800', fontSize: '15px',
    fontFamily: 'var(--font-display)', letterSpacing: '0.5px',
    boxShadow: '0 4px 20px var(--accent-glow)',
    marginTop: '4px',
  },
  btnDisabled: {
    padding: '13px', background: 'var(--bg-elevated)',
    color: 'var(--text-muted)', border: '1px solid var(--border)',
    borderRadius: '10px', cursor: 'not-allowed',
    fontWeight: '700', fontSize: '15px',
    fontFamily: 'var(--font-display)', marginTop: '4px',
  },
  footer: {
    textAlign: 'center', fontSize: '11px',
    color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
    marginTop: '4px',
  },
}