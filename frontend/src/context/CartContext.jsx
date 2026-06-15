import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from "react"

import { useUser, useAuth } from "@clerk/clerk-react"

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api"

const CartContext = createContext()

async function fetchCartAPI(token) {
  const response = await fetch(`${API_URL}/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  })

  if (!response.ok) {
    throw new Error("Erro ao buscar carrinho")
  }

  return response.json()
}

async function addItemAPI(token, listingId) {
  const response = await fetch(`${API_URL}/cart/items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ listingId })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Erro ao adicionar item")
  }

  return response.json()
}

async function removeItemAPI(token, listingId) {
  const response = await fetch(
    `${API_URL}/cart/items/${listingId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  if (!response.ok) {
    throw new Error("Erro ao remover item")
  }

  return response.json()
}

async function clearCartAPI(token) {
  const response = await fetch(`${API_URL}/cart`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error("Erro ao limpar carrinho")
  }

  return response.json()
}

export function CartProvider({ children }) {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()

  const [cartItems, setCartItems] = useState([])
  const [cartTotal, setCartTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // =========================
  // LOAD CART
  // =========================

  useEffect(() => {
    async function loadCart() {
      if (!isLoaded) return

      // usuário deslogado
      if (!user) {
        setCartItems([])
        setCartTotal(0)
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        const token = await getToken()

        if (!token) {
          setLoading(false)
          return
        }

        const data = await fetchCartAPI(token)

        setCartItems(data.items || [])
        setCartTotal(data.total || 0)
      } catch (err) {
        console.error("Erro ao carregar carrinho:", err)
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [user, isLoaded, getToken])

  // =========================
  // ADD TO CART
  // =========================

  const addToCart = useCallback(
    async (item) => {
      if (!user) {
        setError("Precisa estar logado")
        return
      }

      try {
        const token = await getToken()

        if (!token) {
          setError("Erro de autenticação")
          return
        }

        const data = await addItemAPI(token, item.id)

        setCartItems(data.items || [])
        setCartTotal(data.total || 0)

        setError(null)
      } catch (err) {
        console.error(err)
        setError(err.message)
      }
    },
    [user, getToken]
  )

  // =========================
  // REMOVE FROM CART
  // =========================

  const removeFromCart = useCallback(
    async (itemId) => {
      if (!user) return

      try {
        const token = await getToken()

        if (!token) {
          setError("Erro de autenticação")
          return
        }

        const data = await removeItemAPI(token, itemId)

        setCartItems(data.items || [])
        setCartTotal(data.total || 0)
      } catch (err) {
        console.error("Erro ao remover item:", err)
        setError(err.message)
      }
    },
    [user, getToken]
  )

  // =========================
  // CLEAR CART
  // =========================

  const clearCart = useCallback(async () => {
    if (!user) return

    try {
      const token = await getToken()

      if (!token) return

      await clearCartAPI(token)

      setCartItems([])
      setCartTotal(0)
    } catch (err) {
      console.error(err)
    }
  }, [user, getToken])

  // =========================
  // HELPERS
  // =========================

  const getCartTotal = () => {
    if (typeof cartTotal === "string") {
      return parseFloat(cartTotal.replace(",", ".")) || 0
    }

    return cartTotal || 0
  }

  const getItemsByStore = () => {
    const grouped = {}

    cartItems.forEach((item) => {
      const listing = item.listingId

      if (!listing) return

      const store = listing.storeId

      if (!store) return

      const storeId = store._id || store.id

      let storeRating = 0

      if (store.rating) {
        if (typeof store.rating === "object") {
          storeRating =
            store.rating.average ||
            store.rating.reviewsCount ||
            0
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

      const numericPrice =
        typeof price === "string"
          ? parseFloat(price.replace(",", "."))
          : price || 0

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

  // =========================
  // REFRESH CART
  // =========================

  const refreshCart = useCallback(async () => {
    if (!user) return

    try {
      const token = await getToken()

      if (!token) return

      const data = await fetchCartAPI(token)

      setCartItems(data.items || [])
      setCartTotal(data.total || 0)
    } catch (err) {
      console.error(err)
    }
  }, [user, getToken])

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        loading,
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
    throw new Error(
      "useCart must be used within a CartProvider"
    )
  }

  return context
}