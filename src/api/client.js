const API_BASE = '/api/admin'

function getToken() {
  return localStorage.getItem('jyotish_admin_token')
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `Request failed (${response.status})`)
  }

  return response.json()
}

export function adminLogin(email, password) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function fetchStats() {
  return request('/stats')
}

export function fetchUsers() {
  return request('/users')
}

export function fetchUserDetail(userId) {
  return request(`/users/${userId}`)
}
