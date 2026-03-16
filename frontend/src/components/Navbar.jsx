import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const onHistory = location.pathname === '/history'

  return (
    <nav style={s.nav}>
      <div style={s.left}>
        <span style={s.logo} onClick={() => navigate('/dashboard')}>
          <span style={s.logoDot}/>
          QueryMind
        </span>
        <span style={s.badge}>AI · SQL</span>
      </div>
      <div style={s.right}>
        <span style={s.email}>{user?.email}</span>
        <button
          style={onHistory ? s.btnPrimary : s.btnGhost}
          onClick={() => navigate(onHistory ? '/dashboard' : '/history')}
        >
          {onHistory ? '← Dashboard' : 'History'}
        </button>
        <button style={s.btnDanger} onClick={() => { logout(); navigate('/') }}>
          Logout
        </button>
      </div>
    </nav>
  )
}

const s = {
  nav: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.75rem', height: '58px',
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky', top: 0, zIndex: 100,
    backdropFilter: 'blur(12px)',
  },
  left: { display: 'flex', alignItems: 'center', gap: '12px' },
  logo: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '19px', fontWeight: '800',
    color: 'var(--text-primary)', cursor: 'pointer',
    letterSpacing: '-0.5px',
  },
  logoDot: {
    width: '8px', height: '8px',
    borderRadius: '50%', background: 'var(--accent)',
    boxShadow: '0 0 8px var(--accent)',
    display: 'inline-block',
  },
  badge: {
    fontSize: '10px', fontWeight: '700',
    padding: '2px 8px', borderRadius: '20px',
    background: 'var(--accent-glow)',
    color: 'var(--accent)',
    border: '1px solid var(--accent-dim)',
    letterSpacing: '1px',
  },
  right: { display: 'flex', alignItems: 'center', gap: '12px' },
  email: { color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' },
  btnPrimary: {
    padding: '6px 16px', borderRadius: '8px',
    background: 'var(--accent)', color: 'var(--bg-base)',
    border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: '700',
    fontFamily: 'var(--font-display)',
  },
  btnGhost: {
    padding: '6px 16px', borderRadius: '8px',
    background: 'transparent',
    color: 'var(--accent)', border: '1px solid var(--accent-dim)',
    cursor: 'pointer', fontSize: '13px', fontWeight: '600',
    fontFamily: 'var(--font-display)',
    transition: 'background 0.2s',
  },
  btnDanger: {
    padding: '6px 16px', borderRadius: '8px',
    background: 'transparent',
    color: 'var(--text-muted)', border: '1px solid var(--border)',
    cursor: 'pointer', fontSize: '13px',
    fontFamily: 'var(--font-display)',
  },
}