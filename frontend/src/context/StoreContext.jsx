import { createContext, useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { storeAPI } from '../services/api'

export const StoreContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export function StoreProvider({ children }) {
  const { user, isLoaded } = useUser()

  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState([])

  const [listingFilters, setListingFilters] = useState({
    condition: '',
    priceMin: '',
    priceMax: '',
    certified: '',
    language: '',
  })

  async function fetchStore() {
    if (!isLoaded || !user?.id) {
      setStore(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const token = await window.Clerk?.session?.getToken()

      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/stores/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStore(data)
      } else {
        setStore(null)
      }
    } catch (err) {
      console.error('Erro fetchStore:', err)
      setStore(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStore()
  }, [user, isLoaded])

  const updateStore = async (updates) => {
    const previousStore = store

    setStore((prev) => {
      if (!prev) return null
      if (updates.location) {
        return { ...prev, ...updates, location: { ...prev.location, ...updates.location } }
      }
      return { ...prev, ...updates }
    })

    try {
      const payload = { ...updates }
      if (updates.city || updates.state) {
        payload.location = {
          ...(store?.location || {}),
          ...(updates.city !== undefined && { city: updates.city }),
          ...(updates.state !== undefined && { state: updates.state }),
        }
        delete payload.city
        delete payload.state
      }

      const updated = await storeAPI.update(payload)
      setStore(updated)
      return updated
    } catch (err) {
      console.error('Erro updateStore:', err)
      setStore(previousStore)
      throw err
    }
  }

  const addListing = (listing) => {
    setListings((prev) => [listing, ...prev])
  }

  const removeListing = (listingId) => {
    setListings((prev) =>
      prev.filter((item) => item._id !== listingId)
    )
  }

  const updateListing = (listingId, updates) => {
    setListings((prev) =>
      prev.map((item) =>
        item._id === listingId
          ? { ...item, ...updates }
          : item
      )
    )
  }

  return (
    <StoreContext.Provider
      value={{
        store,
        loading,
        hasStore: !!store,

        fetchStore,
        updateStore,

        listingFilters,
        setListingFilters,

        hasListings: listings.length > 0,
        isLoading: loading,

        listings,
        addListing,
        removeListing,
        updateListing,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}