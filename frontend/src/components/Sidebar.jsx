import { useState } from 'react'
import { addConnection, deleteConnection } from '../api'

export default function Sidebar({ connections, onConnectionsChange, selectedConn, onConnSelect }) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [form, setForm] = useState({
    name: '', host: 'localhost', port: 5432,
    database: '', db_user: 'postgres', db_password: ''
  })

  const fields = [
    { key: 'name',        label: 'Connection name', type: 'text' },
    { key: 'host',        label: 'Host',            type: 'text' },
    { key: 'port',        label: 'Port',            type: 'number' },
    { key: 'database',    label: 'Database',        type: 'text' },
    { key: 'db_user',     label: 'Username',        type: 'text' },
    { key: 'db_password', label: 'Password',        type: 'password' },
  ]

  const handleAdd = async () => {
    setError(''); setLoading(true)
    try {
      await addConnection({ ...form, port: Number(form.port) })
      setShowForm(false)
      setForm({ name:'', host:'localhost', port:5432, database:'', db_user:'postgres', db_password:'' })
      onConnectionsChange()
    } catch(err) {
      setError(err.response?.data?.detail || 'Connection failed')
    } finally { setLoading(false) }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    await deleteConnection(id)
    onConnectionsChange()
  }

  return (
    <aside style={s.sidebar}>
      <div style={s.sideHeader}>
        <span style={s.sideTitle}>
          <span style={s.dot}/>
          Databases
        </span>
        <button style={showForm ? s.closeBtn : s.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕' : '+ Add'}
        </button>
      </div>

      {showForm && (
        <div style={s.form}>
          {fields.map(({ key, label, type }) => (
            <div key={key} style={s.fieldWrap}>
              <label style={s.label}>{label}</label>
              <input
                style={s.input}
                type={type}
                placeholder={label}
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
          {error && <p style={s.error}>{error}</p>}
          <button
            style={loading ? s.btnDisabled : s.btnSave}
            onClick={handleAdd} disabled={loading}
          >
            {loading ? 'Testing connection...' : 'Save & Connect'}
          </button>
        </div>
      )}

      <div style={s.connList}>
        {connections.length === 0 && !showForm && (
          <div style={s.empty}>
            <div style={s.emptyIcon}>⬡</div>
            <p style={s.emptyText}>No connections yet</p>
            <p style={s.emptyHint}>Add a database to get started</p>
          </div>
        )}
        {connections.map(conn => (
          <div
            key={conn.id}
            style={selectedConn == conn.id ? s.connActive : s.conn}
            onClick={() => onConnSelect(conn.id)}
          >
            {selectedConn == conn.id && <div style={s.activeBar}/>}
            <div style={s.connName}>{conn.name}</div>
            <div style={s.connMeta}>{conn.database} · {conn.host}</div>
            <button style={s.delBtn} onClick={e => handleDelete(e, conn.id)}>✕</button>
          </div>
        ))}
      </div>
    </aside>
  )
}

const s = {
  sidebar: {
    width: '260px', minWidth: '260px',
    background: 'var(--bg-surface)',
    borderRight: '1px solid var(--border)',
    height: 'calc(100vh - 58px)',
    overflowY: 'auto', display: 'flex', flexDirection: 'column',
  },
  sideHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 1rem 0.75rem',
    borderBottom: '1px solid var(--border)',
  },
  sideTitle: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '12px', fontWeight: '700',
    color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase',
  },
  dot: {
    width: '6px', height: '6px', borderRadius: '50%',
    background: 'var(--green)', boxShadow: '0 0 6px var(--green)',
    display: 'inline-block',
  },
  addBtn: {
    padding: '4px 12px', background: 'var(--accent)',
    color: 'var(--bg-base)', border: 'none', borderRadius: '6px',
    cursor: 'pointer', fontSize: '12px', fontWeight: '700',
    fontFamily: 'var(--font-display)',
  },
  closeBtn: {
    padding: '4px 10px', background: 'var(--bg-hover)',
    color: 'var(--text-secondary)', border: '1px solid var(--border)',
    borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
    fontFamily: 'var(--font-display)',
  },
  form: {
    padding: '1rem', display: 'flex', flexDirection: 'column',
    gap: '8px', borderBottom: '1px solid var(--border)',
    background: 'var(--bg-elevated)',
  },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.5px' },
  input: {
    padding: '8px 10px', background: 'var(--bg-base)',
    border: '1px solid var(--border)', borderRadius: '6px',
    color: 'var(--text-primary)', fontSize: '13px', width: '100%',
    fontFamily: 'var(--font-mono)',
  },
  btnSave: {
    padding: '9px', background: 'var(--accent)',
    color: 'var(--bg-base)', border: 'none', borderRadius: '6px',
    cursor: 'pointer', fontSize: '13px', fontWeight: '700',
    fontFamily: 'var(--font-display)', marginTop: '4px',
  },
  btnDisabled: {
    padding: '9px', background: 'var(--border)',
    color: 'var(--text-muted)', border: 'none', borderRadius: '6px',
    cursor: 'not-allowed', fontSize: '13px',
    fontFamily: 'var(--font-display)', marginTop: '4px',
  },
  error: { color: 'var(--red)', fontSize: '12px' },
  connList: { flex: 1, padding: '8px' },
  conn: {
    padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
    position: 'relative', marginBottom: '4px',
    border: '1px solid transparent', transition: 'background 0.15s',
  },
  connActive: {
    padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
    position: 'relative', marginBottom: '4px',
    background: 'var(--accent-glow)',
    border: '1px solid var(--accent-dim)',
    overflow: 'hidden',
  },
  activeBar: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: '3px', background: 'var(--accent)',
    boxShadow: '0 0 8px var(--accent)',
  },
  connName: { color: 'var(--text-primary)', fontSize: '13px', fontWeight: '600', paddingRight: '20px' },
  connMeta: { color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px', fontFamily: 'var(--font-mono)' },
  delBtn: {
    position: 'absolute', top: '8px', right: '8px',
    background: 'transparent', border: 'none',
    color: 'var(--text-muted)', cursor: 'pointer', fontSize: '11px', padding: '2px 4px',
  },
  empty: { padding: '2rem 1rem', textAlign: 'center' },
  emptyIcon: { fontSize: '28px', color: 'var(--text-muted)', marginBottom: '8px' },
  emptyText: { color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' },
  emptyHint: { color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' },
}