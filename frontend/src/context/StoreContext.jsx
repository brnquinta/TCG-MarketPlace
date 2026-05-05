import { createContext, useContext, useState } from 'react'
const StoreContext = createContext(null)
export function StoreProvider({ children }) {
  const [store, setStore] = useState({
    name: 'Loja do Bruno TCG',
    slug: 'loja-do-bruno-tcg',
    logoUrl: '',
    bannerUrl: '',
    description: 'Loja focada em cartas Pokémon para coleção e competitivo.',
    location: {
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    status: 'draft',
    onboardingStatus: 'pending',
    rating: {
      average: 4.8,
      reviewsCount: 24,
    },
    stats: {
      activeListings: 0,
      totalSales: 0,
      totalViews: 0,
    },
  })
  const [listingFilters, setListingFilters] = useState({
    condition: '',
    priceMin: '',
    priceMax: '',
    certified: '',
    language: '',
  })
  const updateStore = (updates) => {
    setStore((prev) => ({ ...prev, ...updates }))
  }
  const updateLocation = (updates) => {
    setStore((prev) => ({
      ...prev,
      location: { ...prev.location, ...updates },
    }))
  }
  return (
    <StoreContext.Provider
      value={{
        store,
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
    throw new Error('useStore must be used within StoreProvider')
  }
  return context
}