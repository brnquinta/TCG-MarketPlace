import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { useUser } from "@clerk/clerk-react"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const CartContext = createContext()

async function fetchCartAPI(token) {
  try {
    const response = await fetch(`${API_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) throw new Error('Failed to fetch cart')
    return await response.json()
  } catch (error) {
    console.error('Error fetching cart:', error)
    return { items: [], total: 0 }
  }
}

async function addItemAPI(token, listingId) {
  try {
    const response = await fetch(`${API_URL}/cart/items`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ listingId })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to add item')
    }
    return await response.json()
  } catch (error) {
    console.error('Error adding item:', error)
    throw error
  }
}

async function removeItemAPI(token, listingId) {
  try {
    const response = await fetch(`${API_URL}/cart/items/${listingId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (!response.ok) throw new Error('Failed to remove item')
    return await response.json()
  } catch (error) {
    console.error('Error removing item:', error)
    throw error
  }
}

async function clearCartAPI(token) {
  try {
    const response = await fetch(`${API_URL}/cart`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (!response.ok) throw new Error('Failed to clear cart')
    return await response.json()
  } catch (error) {
    console.error('Error clearing cart:', error)
    throw error
  }
}

function useClerkToken() {
  const { user, isLoaded } = useUser()
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getToken() {
      console.log('useClerkToken - isLoaded:', isLoaded, 'user:', user ? 'sim' : 'nao')
      
      if (!isLoaded || !user) {
        setToken(null)
        setLoading(false)
        return
      }

      try {
        console.log('window.Clerk:', window.Clerk ? 'existe' : 'nao')
        
        if (window.Clerk?.session) {
          console.log('Tentando getToken via Clerk.session')
          const t = await window.Clerk.session.getToken()
          console.log('Token obtido:', t ? 'sim' : 'nao')
          setToken(t)
        } else {
          console.log('Procurando no localStorage...')
          const keys = Object.keys(localStorage)
          console.log('Keys:', keys)
          
          for (const key of keys) {
            if (key.includes('clerk') || key.includes('jwt') || key.includes('db')) {
              const t = localStorage.getItem(key)
              console.log(`Key ${key}:`, t ? `sim (${t.substring(0, 30)}...)` : 'nao')
              if (t && t.length > 50 && t.includes('.')) {
                setToken(t)
                break
              }
            }
          }
        }
      } catch (e) {
        console.log('Erro ao buscar token:', e)
      } finally {
        setLoading(false)
      }
    }

    getToken()
  }, [user, isLoaded])

  console.log('useClerkToken retornando:', token ? 'tem token' : 'sem token', 'loading:', loading)
  
  return { token, loading }
}

export function CartProvider({ children }) {
  const { user, isLoaded: userLoaded } = useUser()
  const { token, loading: tokenLoading } = useClerkToken()
  
  const [cartItems, setCartItems] = useState([])
  const [cartTotal, setCartTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const prevTokenRef = useRef(null)
  
  useEffect(() => {
    if (token === prevTokenRef.current) return
    prevTokenRef.current = token
    
    async function loadCart() {
      console.log('loadCart - userLoaded:', userLoaded, 'tokenLoading:', tokenLoading, 'user:', user ? 'sim' : 'nao', 'token:', token ? 'sim' : 'nao')

      if (!userLoaded || tokenLoading) {
        console.log('Aguardando...')
        return
      }

      if (!user) {
        console.log('Usuario nao logado')
        setLoading(false)
        return
      }

      if (!token) {
        console.log('Token nao disponivel ainda, tentando novamente...')
        await new Promise(r => setTimeout(r, 500))
        if (!window.Clerk?.session) {
          setLoading(false)
          return
        }
        try {
          const newToken = await window.Clerk.session.getToken()
          if (!newToken) {
            setLoading(false)
            return
          }
          const data = await fetchCartAPI(newToken)
          setCartItems(data.items || [])
          setCartTotal(data.total || 0)
          setLoading(false)
          return
        } catch (e) {
          console.log('Erro ao obter token:', e)
          setLoading(false)
          return
        }
      }

      try {
        const data = await fetchCartAPI(token)
        setCartItems(data.items || [])
        setCartTotal(data.total || 0)
      } catch (err) {
        console.error('Error loading cart:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [user, userLoaded, token, tokenLoading])

  const addToCart = useCallback(async (item) => {
    if (!user) {
      setError('Precisa estar logado para adicionar ao carrinho')
      return
    }

    if (!token) {
      setError('Aguarde, autenticando...')
      return
    }

    let listingId = item.id
    
    if (!listingId || listingId === '1') {
      setError('Anuncio nao encontrado no sistema')
      return
    }

    try {
      const data = await addItemAPI(token, listingId)
      setCartItems(data.items || [])
      setCartTotal(data.total || 0)
      setError(null)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [user, token])

  const removeFromCart = useCallback(async (itemId) => {
    if (!user || !token) return

    try {
      const data = await removeItemAPI(token, itemId)
      setCartItems(data.items || [])
      setCartTotal(data.total || 0)
    } catch (err) {
      console.error('Error removing from cart:', err)
    }
  }, [user, token])

  const clearCart = useCallback(async () => {
    if (!user || !token) return

    try {
      await clearCartAPI(token)
      setCartItems([])
      setCartTotal(0)
    } catch (err) {
      console.error('Error clearing cart:', err)
    }
  }, [user, token])

  const getCartTotal = () => {
    if (typeof cartTotal === 'string') {
      return parseFloat(cartTotal.replace(',', '.')) || 0
    }
    return cartTotal || 0
  }

  const getItemsByStore = () => {
    const grouped = {}
    console.log('getItemsByStore - cartItems:', JSON.stringify(cartItems, null, 2))
    
    cartItems.forEach((item) => {
      const listing = item.listingId
      if (!listing) return
      
      const store = listing.storeId
      if (!store) return
      
      console.log('Store:', JSON.stringify(store, null, 2))
      
      const storeId = store._id || store.id
      let storeRating = 0
      
      if (store.rating) {
        if (typeof store.rating === 'object') {
          storeRating = store.rating.average || store.rating.reviewsCount || 0
        } else {
          storeRating = store.rating
        }
      }
      
      if (!grouped[storeId]) {
        grouped[storeId] = {
          store: {
            id: storeId,
            name: store.name,
            rating: storeRating
          },
          items: []
        }
      }
      
      const price = listing.listingData.price
      const numericPrice = typeof price === 'string' ? parseFloat(price.replace(',', '.')) : (price || 0)
      
      grouped[storeId].items.push({
        id: listing._id,
        cardSnapshot: listing.cardSnapshot,
        listingData: {
          ...listing.listingData,
          price: numericPrice
        },
        store: grouped[storeId].store
      })
    })
    return grouped
  }

  const refreshCart = useCallback(async () => {
    if (!user || !token) return
    
    const data = await fetchCartAPI(token)
    setCartItems(data.items || [])
    setCartTotal(data.total || 0)
  }, [user, token])

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        loading: loading || tokenLoading,
        error,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        getItemsByStore,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}