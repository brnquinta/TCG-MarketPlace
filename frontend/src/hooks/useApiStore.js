import { useState, useCallback } from 'react'
import { useUser } from '@clerk/clerk-react'
import { authAPI, storeAPI, listingAPI } from '../services/api'
import { useStore } from './useStore'

export function useApiStore() {
  const { user, isLoaded } = useUser()
  const { createStore: setLocalStore, addListing: addLocalListing, removeListing: removeLocalListing, updateStore: updateLocalStore } = useStore()
  
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState(null)

  const syncUserToBackend = useCallback(async () => {
    if (!user || !isLoaded) return
    
    setIsSyncing(true)
    setError(null)
    
    try {
      await authAPI.syncUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      })
    } catch (err) {
      console.error('Error syncing user:', err)
      setError(err.message)
    } finally {
      setIsSyncing(false)
    }
  }, [user, isLoaded])

  const fetchStoreFromBackend = useCallback(async () => {
    if (!user) return null
    
    try {
      const response = await storeAPI.getMyStore()
      return response.data
    } catch (err) {
      if (err.response?.status === 404) {
        return null
      }
      console.error('Error fetching store:', err)
      return null
    }
  }, [user])

  const createStoreOnBackend = useCallback(async (storeData) => {
    try {
      const response = await storeAPI.create(storeData)
      setLocalStore({
        name: response.data.name,
        slug: response.data.slug,
        logoUrl: response.data.logoUrl,
        description: response.data.description,
        location: response.data.location,
      })
      return response.data
    } catch (err) {
      console.error('Error creating store:', err)
      throw err
    }
  }, [setLocalStore])

  const updateStoreOnBackend = useCallback(async (storeData) => {
    try {
      const response = await storeAPI.update(storeData)
      updateLocalStore(response.data)
      return response.data
    } catch (err) {
      console.error('Error updating store:', err)
      throw err
    }
  }, [updateLocalStore])

  const fetchListingsFromBackend = useCallback(async () => {
    if (!user) return []
    
    try {
      const response = await listingAPI.getMyListings()
      return response.data
    } catch (err) {
      console.error('Error fetching listings:', err)
      return []
    }
  }, [user])

  const createListingOnBackend = useCallback(async (listingData) => {
    try {
      const response = await listingAPI.create(listingData)
      addLocalListing(response.data)
      return response.data
    } catch (err) {
      console.error('Error creating listing:', err)
      throw err
    }
  }, [addLocalListing])

  const deleteListingOnBackend = useCallback(async (listingId) => {
    try {
      await listingAPI.delete(listingId)
      removeLocalListing(listingId)
    } catch (err) {
      console.error('Error deleting listing:', err)
      throw err
    }
  }, [removeLocalListing])

  const fetchPublicListings = useCallback(async (params = {}) => {
    try {
      const response = await listingAPI.getPublic(params)
      return response.data
    } catch (err) {
      console.error('Error fetching public listings:', err)
      return { listings: [], total: 0, page: 1, pages: 1 }
    }
  }, [])

  return {
    syncUserToBackend,
    fetchStoreFromBackend,
    createStoreOnBackend,
    updateStoreOnBackend,
    fetchListingsFromBackend,
    createListingOnBackend,
    deleteListingOnBackend,
    fetchPublicListings,
    isSyncing,
    error,
  }
}