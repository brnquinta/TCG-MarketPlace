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

  const rawText = await res.clone().text()

  if (!res.ok) {
    let error = {}

    try {
      error = JSON.parse(rawText)
    } catch (e) {
      // ignore parse error
    }

    throw new Error(error.message || 'Erro na requisição')
  }

  const data = JSON.parse(rawText)

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

  getPublicBySlug: (slug) => request(`/stores/slug/${slug}`),

  create: (data) =>
    request('/stores', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (data) =>
    request('/stores/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
}

/* ================= LISTINGS ================= */
export const listingAPI = {
  getMyListings: () => request('/listings/my'),

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

/* ================= UPLOADS ================= */
export const uploadAPI = {
  uploadListingPhotos: async (formData) => {
    const token = await window.Clerk?.session?.getToken()

    const res = await fetch(`${API_URL}/uploads/listing-photos`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    const rawText = await res.clone().text()

    if (!res.ok) {
      let error = {}
      try {
        error = JSON.parse(rawText)
      } catch (e) {
        // ignore parse error
      }
      throw new Error(error.message || 'Erro no upload das fotos')
    }

    return JSON.parse(rawText)
  },

  uploadStoreImage: async (file) => {
    const token = await window.Clerk?.session?.getToken()

    const formData = new FormData()
    formData.append('image', file)

    const res = await fetch(`${API_URL}/uploads/store-image`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    if (!res.ok) {
      let error = {}
      try {
        error = await res.json()
      } catch (e) {
        // ignore
      }
      throw new Error(error.message || 'Erro no upload da imagem')
    }

    return res.json()
  },
}