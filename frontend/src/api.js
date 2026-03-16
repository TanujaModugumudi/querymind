import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const registerUser = (data) =>
  api.post('/auth/register', data)

export const loginUser = (email, password) => {
  const formData = new FormData()
  formData.append('username', email)
  formData.append('password', password)
  return api.post('/auth/login', formData)
}

export const getMe = () =>
  api.get('/auth/me')

export const getConnections = () =>
  api.get('/connections/')

export const addConnection = (data) =>
  api.post('/connections/', data)

export const deleteConnection = (id) =>
  api.delete(`/connections/${id}`)

export const getSchema = (id) =>
  api.get(`/connections/${id}/schema`)

export const runQuery = (question, connectionId) =>
  api.post('/query/', {
    question,
    connection_id: connectionId
  })

export const getHistory = () =>
  api.get('/history/')

export const deleteHistoryItem = (id) =>
  api.delete(`/history/${id}`)

export const clearHistory = () =>
  api.delete('/history/')