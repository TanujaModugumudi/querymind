import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend
} from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend
)

const COLORS = [
  '#7c83fd', '#34d399', '#f87171',
  '#fbbf24', '#60a5fa', '#a78bfa',
  '#fb923c', '#38bdf8'
]

export default function ChartView({ data, columns, chartType }) {
  if (!data || data.length === 0) return null
  if (chartType === 'table') return null
  if (columns.length < 2) return null

  const labelCol = columns[0]
  const valueCol = columns.find((col, idx) => {
    if (idx === 0) return false
    const val = data[0][col]
    return !isNaN(Number(val)) && val !== null
  }) || columns[1]

  const labels = data.map(row => String(row[labelCol]))
  const values = data.map(row => Number(row[valueCol]))

  const chartData = {
    labels,
    datasets: [{
      label: valueCol,
      data: values,
      backgroundColor: COLORS,
      borderColor: COLORS,
      borderWidth: 1,
      tension: 0.4,
    }]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: chartType === 'pie' },
      tooltip: { enabled: true },
    },
    scales: chartType !== 'pie' ? {
      x: {
        ticks: { color: '#6b7280' },
        grid: { color: '#1e2135' },
      },
      y: {
        ticks: { color: '#6b7280' },
        grid: { color: '#1e2135' },
      }
    } : {},
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <span style={styles.label}>Chart — {chartType}</span>
      </div>
      <div style={styles.chartArea}>
        {chartType === 'bar'  && <Bar  data={chartData} options={options} />}
        {chartType === 'line' && <Line data={chartData} options={options} />}
        {chartType === 'pie'  && <Pie  data={chartData} options={options} />}
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    background: '#1a1d27',
    border: '1px solid #2d3148',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  header: {
    padding: '10px 16px',
    borderBottom: '1px solid #2d3148',
    background: '#13151f',
  },
  label: {
    color: '#7c83fd',
    fontSize: '13px',
    fontWeight: '600',
  },
  chartArea: {
    padding: '1.5rem',
    maxHeight: '350px',
    display: 'flex',
    justifyContent: 'center',
  },
}