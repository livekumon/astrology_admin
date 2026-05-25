const raw = (import.meta.env.VITE_API_URL || '/api').trim()
export const API_BASE = raw.replace(/\/$/, '')

export function adminApiUrl(path = '') {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}/admin${normalized}`
}

export async function parseJsonResponse(response) {
  const text = await response.text()
  if (!text) return {}

  try {
    return JSON.parse(text)
  } catch {
    const preview = text.replace(/\s+/g, ' ').slice(0, 120)
    throw new Error(
      response.ok
        ? 'Server returned an invalid response'
        : `Request failed (${response.status}): ${preview}`,
    )
  }
}
