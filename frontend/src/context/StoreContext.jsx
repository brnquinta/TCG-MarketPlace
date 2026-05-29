import { createContext, useContext, useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const { user, isLoaded } = useUser()

  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)

  const [listingFilters, setListingFilters] = useState({
    condition: '',
    priceMin: '',
    priceMax: '',
    certified: '',
    language: '',
  })

  async function fetchStore() {
    if (!isLoaded || !user || !user.id) {
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
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStore(data)
      } else {
        setStore(null)
      }
    } catch (err) {
      console.error(err)
      setStore(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStore()
  }, [user, isLoaded])

  const updateStore = (updates) => {
    setStore((prev) =>
      prev ? { ...prev, ...updates } : null
    )
  }

  const updateLocation = (updates) => {
    setStore((prev) =>
      prev
        ? {
            ...prev,
            location: {
              ...prev.location,
              ...updates
            }
          }
        : null
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
        updateLocation,
        listingFilters,
        setListingFilters,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)

  if (!context) {
    throw new Error(
      'useStore must be used within StoreProvider'
    )
  }

  return context
}