import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/clerk-react'
import { StoreContext } from './StoreContext'
import { authAPI, storeAPI, listingAPI } from '../services/api'

const STORAGE_KEY = 'tcg_marketplace_store'
const LISTINGS_KEY = 'tcg_marketplace_listings'

function getInitialStore() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function getStoredListings() {
  try {
    const stored = localStorage.getItem(LISTINGS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.warn('LocalStorage save failed:', e)
  }
}

export function StoreProvider({ children }) {
  const { user, isLoaded, isSignedIn } = useUser()
  
  const [store, setStore] = useState(() => getInitialStore())
  const [listings, setListings] = useState(() => getStoredListings())
  const [isLoading, setIsLoading] = useState(true)
  const [syncError, setSyncError] = useState(null)

  useEffect(() => {
    const syncData = async () => {
      if (!isSignedIn || !user) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setSyncError(null)

      try {
        await authAPI.syncUser({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        })

        const storeRes = await storeAPI.getMyStore()
        if (storeRes.data) {
          setStore(storeRes.data)
          saveToLocalStorage(STORAGE_KEY, storeRes.data)
          
          const listingsRes = await listingAPI.getMyListings()
          setListings(listingsRes.data)
          saveToLocalStorage(LISTINGS_KEY, listingsRes.data)
        }
      } catch (err) {
        console.warn('Backend sync failed, using localStorage:', err.message)
        setSyncError('Offline mode - using local data')
        setStore(getInitialStore())
        setListings(getStoredListings())
      } finally {
        setIsLoading(false)
      }
    }

    syncData()
  }, [user, isSignedIn, isLoaded])

  const hasStore = store !== null
  const hasListings = listings.length > 0

  const [listingFilters, setListingFilters] = useState({
    condition: '',
    priceMin: '',
    priceMax: '',
    certified: '',
    language: '',
  })

  const createStore = useCallback(async (storeData) => {
    const newStoreData = {
      name: storeData.name || '',
      slug: storeData.slug || '',
      logoUrl: storeData.logoUrl || '',
      bannerUrl: storeData.bannerUrl || '',
      description: storeData.description || '',
      location: {
        city: storeData.city || '',
        state: storeData.state || '',
      },
    }

    try {
      const response = await storeAPI.create(newStoreData)
      setStore(response.data)
      saveToLocalStorage(STORAGE_KEY, response.data)
      return response.data
    } catch (err) {
      console.error('Backend createStore failed:', err)
      const localStore = { ...newStoreData, _id: `local_${Date.now()}`, status: 'draft' }
      setStore(localStore)
      saveToLocalStorage(STORAGE_KEY, localStore)
      return localStore
    }
  }, [])

  const updateStore = useCallback(async (updates) => {
    const updated = store ? { ...store, ...updates } : updates
    
    try {
      const response = await storeAPI.update(updates)
      setStore(response.data)
      saveToLocalStorage(STORAGE_KEY, response.data)
    } catch (err) {
      console.warn('Backend updateStore failed, updating locally:', err.message)
      setStore(updated)
      saveToLocalStorage(STORAGE_KEY, updated)
    }
  }, [store])

  const updateLocation = useCallback(async (updates) => {
    const updated = store ? { ...store, location: { ...store.location, ...updates } } : null
    if (!updated) return

    try {
      const response = await storeAPI.update({ location: updated.location })
      setStore(response.data)
      saveToLocalStorage(STORAGE_KEY, response.data)
    } catch (err) {
      console.warn('Backend updateLocation failed:', err.message)
      setStore(updated)
      saveToLocalStorage(STORAGE_KEY, updated)
    }
  }, [store])

  const deleteStore = useCallback(() => {
    setStore(null)
    setListings([])
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LISTINGS_KEY)
  }, [])

  const addListing = useCallback(async (listing) => {
    const newListing = {
      ...listing,
      _id: `listing_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    try {
      const response = await listingAPI.create(listing)
      setListings((prev) => {
        const updated = [...prev, response.data]
        saveToLocalStorage(LISTINGS_KEY, updated)
        return updated
      })
      
      if (store) {
        setStore((prev) => {
          if (!prev) return prev
          const updated = { ...prev, stats: { ...prev.stats, activeListings: prev.stats.activeListings + 1 } }
          saveToLocalStorage(STORAGE_KEY, updated)
          return updated
        })
      }
      return response.data
    } catch (err) {
      console.warn('Backend addListing failed:', err.message)
      setListings((prev) => {
        const updated = [...prev, newListing]
        saveToLocalStorage(LISTINGS_KEY, updated)
        return updated
      })
      return newListing
    }
  }, [store])

  const removeListing = useCallback(async (listingId) => {
    try {
      await listingAPI.delete(listingId)
    } catch (err) {
      console.warn('Backend removeListing failed:', err.message)
    }

    setListings((prev) => {
      const updated = prev.filter((item) => item._id !== listingId)
      saveToLocalStorage(LISTINGS_KEY, updated)
      return updated
    })
    
    if (store) {
      setStore((prev) => {
        if (!prev) return prev
        const updated = { ...prev, stats: { ...prev.stats, activeListings: Math.max(0, prev.stats.activeListings - 1) } }
        saveToLocalStorage(STORAGE_KEY, updated)
        return updated
      })
    }
  }, [store])

  return (
    <StoreContext.Provider
      value={{
        store,
        listings,
        hasStore,
        hasListings,
        isLoading,
        syncError,
        createStore,
        updateStore,
        updateLocation,
        deleteStore,
        addListing,
        removeListing,
        listingFilters,
        setListingFilters,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}