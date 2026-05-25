import { adminApiUrl, parseJsonResponse } from './config'

function getToken() {
  return localStorage.getItem('jyotish_admin_token')
}

async function request(path, options = {}) {
  const response = await fetch(adminApiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  const data = await parseJsonResponse(response)

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`)
  }

  return data
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

export function fetchGeoStats() {
  return request('/geo-stats')
}

export function fetchUserDetail(userId) {
  return request(`/users/${userId}`)
}
