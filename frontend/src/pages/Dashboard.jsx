import { useState, useEffect } from 'react'
import { getConnections, runQuery } from '../api'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import QueryInput from '../components/QueryInput'
import SqlDisplay from '../components/SqlDisplay'
import ResultTable from '../components/ResultTable'
import ChartView from '../components/ChartView'

export default function Dashboard() {
  const [connections, setConnections]   = useState([])
  const [selectedConn, setSelectedConn] = useState(null)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [result, setResult]             = useState(null)

  useEffect(() => {
    fetchConnections()
  }, [])

  const fetchConnections = async () => {
    try {
      const res = await getConnections()
      setConnections(res.data)
      if (res.data.length > 0) {
        setSelectedConn(res.data[0].id)
      }
    } catch (err) {
      console.error('Failed to fetch connections', err)
    }
  }

  const handleQuery = async (question) => {
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const res = await runQuery(question, selectedConn)
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Query failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>
        <Sidebar
          connections={connections}
          onConnectionsChange={fetchConnections}
          selectedConn={selectedConn}
          onConnSelect={setSelectedConn}
        />
        <div style={styles.main}>
          <QueryInput
            onSubmit={handleQuery}
            loading={loading}
            connections={connections}
            selectedConn={selectedConn}
            onConnChange={setSelectedConn}
          />

          {error && (
            <div style={styles.error}>{error}</div>
          )}

          {loading && (
            <div style={styles.loadingBox}>
              ⚡ Thinking... generating SQL and fetching results
            </div>
          )}

          {result && (
            <div style={styles.results}>
              <SqlDisplay
                sql={result.sql_generated}
                explanation={result.explanation}
              />
              <ChartView
                data={result.result}
                columns={result.result.length > 0 ? Object.keys(result.result[0]) : []}
                chartType={result.chart_type}
              />
              <ResultTable
                data={result.result}
                columns={result.result.length > 0 ? Object.keys(result.result[0]) : []}
              />
            </div>
          )}

          {!result && !loading && !error && (
            <div style={styles.welcome}>
              <div style={styles.welcomeGlow}/>
              <h2 style={styles.welcomeTitle}>Ask your database anything</h2>
              <p style={styles.welcomeSub}>
                Type a question in plain English → get SQL + results + charts instantly
              </p>
              <div style={styles.examples}>
                {[
                  'Show me all users',
                  'How many queries has each user run?',
                  'Show the most recent 5 queries',
                  'Count total connections per user',
                ].map(ex => (
                  <div
                    key={ex}
                    style={styles.exampleChip}
                    onClick={() => handleQuery(ex)}
                  >
                    ▸ {ex}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-base)',
    display: 'flex',
    flexDirection: 'column',
  },
  body: {
    display: 'flex',
    flex: 1,
  },
  main: {
    flex: 1,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    overflowY: 'auto',
  },
  error: {
    background: 'rgba(255,77,106,0.08)',
    border: '1px solid var(--red)',
    color: 'var(--red)',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    fontFamily: 'var(--font-mono)',
  },
  loadingBox: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--accent-dim)',
    color: 'var(--accent)',
    padding: '16px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    textAlign: 'center',
    fontFamily: 'var(--font-mono)',
    boxShadow: '0 0 20px var(--accent-glow)',
    animation: 'pulse-glow 1.5s infinite',
  },
  results: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    animation: 'fadeUp 0.4s ease forwards',
  },
  welcome: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    textAlign: 'center',
    position: 'relative',
    animation: 'fadeUp 0.5s ease forwards',
  },
  welcomeGlow: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '12px',
    letterSpacing: '-1px',
    position: 'relative',
  },
  welcomeSub: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    maxWidth: '440px',
    lineHeight: 1.7,
    marginBottom: '2.5rem',
    fontFamily: 'var(--font-mono)',
    position: 'relative',
  },
  examples: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'center',
    maxWidth: '600px',
    position: 'relative',
  },
  exampleChip: {
    padding: '9px 18px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-bright)',
    borderRadius: '24px',
    color: 'var(--accent)',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    transition: 'all 0.2s',
  },
}