const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function request(url, options = {}) {
  const token = await window.Clerk?.session?.getToken()

  console.log('[API] REQUEST →', {
    url: `${API_URL}${url}`,
    method: options.method || 'GET',
    body: options.body ? JSON.parse(options.body) : null,
  })

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  console.log('[API] RESPONSE STATUS →', res.status)

  const rawText = await res.clone().text()

  console.log('[API] RAW RESPONSE →', rawText)

  if (!res.ok) {
    let error = {}

    try {
      error = JSON.parse(rawText)
    } catch (e) {
      console.log('[API] response is not JSON')
    }

    console.error('[API] ERROR RESPONSE →', error)

    throw new Error(error.message || 'Erro na requisição')
  }

  const data = JSON.parse(rawText)

  console.log('[API] SUCCESS →', data)

  return data
}

/* ================= AUTH ================= */
export const authAPI = {
  syncUser: (data) =>
    request('/auth/sync', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

/* ================= STORE ================= */
export const storeAPI = {
  getMyStore: () => request('/stores/me'),

  create: (data) =>
    request('/stores', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (data) =>
    request('/stores', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

/* ================= LISTINGS ================= */
export const listingAPI = {
  getMyListings: () => request('/listings/me'),

  getPublic: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/listings${query ? `?${query}` : ''}`)
  },

  create: (data) =>
    request('/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    request(`/listings/${id}`, {
      method: 'DELETE',
    }),
}