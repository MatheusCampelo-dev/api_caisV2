const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const request = async (path, options = {}) => {
  const url = `${BASE_URL}${path}`
  const token = localStorage.getItem('token')

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  }

  let res
  try {
    res = await fetch(url, config)
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique se o back-end está rodando.')
  }

  if (!res.ok) {
    const erro = await res.json().catch(() => ({ message: 'Erro na requisição' }))
    throw new Error(erro.message || erro.error || `Erro ${res.status}`)
  }

  return res.json()
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' })
}
