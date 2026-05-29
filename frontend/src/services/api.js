const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function request(url, options = {}) {
  const token = await window.Clerk?.session?.getToken()

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || 'Erro na requisição')
  }

  return res.json()
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