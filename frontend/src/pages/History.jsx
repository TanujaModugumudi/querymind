import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHistory, deleteHistoryItem, clearHistory } from '../api'
import Navbar from '../components/Navbar'

export default function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await getHistory()
      setHistory(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    await deleteHistoryItem(id)
    setHistory(history.filter(h => h.id !== id))
  }

  const handleClear = async () => {
    if (!window.confirm('Clear all history?')) return
    await clearHistory()
    setHistory([])
  }

  const formatDate = (str) => {
    return new Date(str).toLocaleString()
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Query History</h1>
          {history.length > 0 && (
            <button style={styles.clearBtn} onClick={handleClear}>
              Clear All
            </button>
          )}
        </div>

        {loading && (
          <p style={styles.muted}>Loading history...</p>
        )}

        {!loading && history.length === 0 && (
          <div style={styles.empty}>
            <p>No queries yet.</p>
            <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        )}

        <div style={styles.list}>
          {history.map(item => (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.question}>{item.question}</div>
                <div style={styles.cardRight}>
                  <span style={item.was_successful ? styles.success : styles.failed}>
                    {item.was_successful ? 'Success' : 'Failed'}
                  </span>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(item.id)}
                  >✕</button>
                </div>
              </div>

              {item.sql_generated && (
                <pre style={styles.sql}>{item.sql_generated}</pre>
              )}

              <div style={styles.meta}>
                <span>{formatDate(item.executed_at)}</span>
                {item.result_rows !== null && (
                  <span>{item.result_rows} rows returned</span>
                )}
                {item.error_message && (
                  <span style={styles.errorMsg}>{item.error_message}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0f1117',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    color: '#e2e8f0',
    fontSize: '22px',
    fontWeight: '700',
  },
  clearBtn: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid #7f1d1d',
    borderRadius: '8px',
    color: '#f87171',
    cursor: 'pointer',
    fontSize: '13px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  card: {
    background: '#1a1d27',
    border: '1px solid #2d3148',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
  question: {
    color: '#e2e8f0',
    fontSize: '15px',
    fontWeight: '500',
    flex: 1,
  },
  cardRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  success: {
    padding: '3px 10px',
    background: '#052e16',
    color: '#34d399',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
  },
  failed: {
    padding: '3px 10px',
    background: '#2d1515',
    color: '#f87171',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
  },
  sql: {
    background: '#0f1117',
    border: '1px solid #2d3148',
    borderRadius: '8px',
    padding: '12px',
    color: '#a3e635',
    fontSize: '12px',
    fontFamily: 'monospace',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    margin: 0,
  },
  meta: {
    display: 'flex',
    gap: '16px',
    fontSize: '12px',
    color: '#4b5280',
  },
  errorMsg: {
    color: '#f87171',
  },
  muted: {
    color: '#4b5280',
    fontSize: '14px',
  },
  empty: {
    textAlign: 'center',
    color: '#4b5280',
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center',
  },
  backBtn: {
    padding: '8px 20px',
    background: '#7c83fd',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: '#4b5280',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '2px 6px',
  },
}