import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { useCart } from "../context/CartContext"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function ListingDetails() {
  const { id } = useParams()
  const { addToCart, error: cartError } = useCart()

  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    async function fetchListing() {
      try {
        const response = await fetch(`${API_URL}/listings/${id}`)
        if (!response.ok) {
          throw new Error('Anuncio nao encontrado')
        }
        const data = await response.json()
        setListing(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchListing()
    }
  }, [id])

  if (loading) return <p>Carregando...</p>
  if (error) return <p>Erro: {error}</p>
  if (!listing) return <p>Anuncio nao encontrado</p>

  const cardSnapshot = listing.cardSnapshot
  const listingData = listing.listingData
  const store = listing.storeId

  const photosArray = listing.photos ? Object.values(listing.photos).filter(Boolean) : []

  const nextPhoto = () => {
    setCurrentPhoto((prev) =>
      prev < photosArray.length - 1 ? prev + 1 : prev
    )
  }

  const prevPhoto = () => {
    setCurrentPhoto((prev) =>
      prev > 0 ? prev - 1 : prev
    )
  }

  const handleAddToCart = async () => {
    try {
      await addToCart({ id: listing._id })
      setAddedToCart(true)

      setTimeout(() => {
        setAddedToCart(false)
      }, 4000)
    } catch (err) {
      console.error('Erro ao adicionar:', err)
    }
  }

  return (
    <div className="listing-details">

      {/* ===== TOPO ===== */}
      <div className="listing-details__top">

        <div className="listing-details__gallery">
          <img
            src={cardSnapshot.imageLarge}
            alt={cardSnapshot.name}
            className="listing-details__main-image"
          />
        </div>

        <div className="listing-details__info">

          <div className="listing-details__badge">
            {cardSnapshot.setName}
          </div>

          <h1 className="listing-details__title">
            {cardSnapshot.name}
          </h1>

          <p className="listing-details__meta">
            #{cardSnapshot.number} • {cardSnapshot.rarity}
          </p>

          <h2 className="listing-details__price">
            R$ {listingData.price.toFixed(2)}
          </h2>

          <div className="listing-details__details">
            <p>Condicao: {listingData.condition}</p>
            <p>Idioma: {listingData.language}</p>
            <p>Quantidade: {listingData.quantity}</p>
          </div>

          <button
            className="listing-details__cart-button"
            onClick={handleAddToCart}
          >
            Adicionar ao carrinho
          </button>

          {addedToCart && (
            <span className="listing-details__success">
              Adicionado ao carrinho, visite o carrinho para concluir a compra.
            </span>
          )}

          {cartError && (
            <span className="listing-details__error" style={{ color: 'red' }}>
              {cartError}
            </span>
          )}

          {listingData.certified && (
            <div className="listing-details__certified">
              {listingData.gradingCompany} {listingData.grade}
            </div>
          )}

          {listingData.acceptsOffer && (
            <div className="listing-details__offer">
              Aceita ofertas
            </div>
          )}

          <p className="listing-details__location">
            {listingData.city} - {listingData.state}
          </p>

        </div>
      </div>

      {/* ===== CAROUSEL ===== */}
      {photosArray.length > 0 && (
        <div className="listing-details__section">

          <div className="listing-details__section-header">
            <h3>Fotos do item</h3>
          </div>

          <div className="listing-details__carousel">

            <button
              className="listing-details__carousel-btn"
              onClick={prevPhoto}
              disabled={currentPhoto === 0}
            >
              ←
            </button>

            <img
              src={photosArray[currentPhoto]}
              className="listing-details__carousel-image"
            />

            <button
              className="listing-details__carousel-btn"
              onClick={nextPhoto}
              disabled={currentPhoto === photosArray.length - 1}
            >
              →
            </button>
          </div>

          <p className="listing-details__carousel-counter">
            {currentPhoto + 1} / {photosArray.length}
          </p>
        </div>
      )}

      {/* ===== DESCRIÇÃO ===== */}
      <div className="listing-details__section">

        <div className="listing-details__section-header">
          <h3>Descricao</h3>
        </div>

        <p className="listing-details__text">
          {listingData.description || 'Sem descricao'}
        </p>

        {listingData.defects && (
          <>
            <h4 className="listing-details__subtitle">
              Defeitos
            </h4>

            <p className="listing-details__text">
              {listingData.defects}
            </p>
          </>
        )}

      </div>

      {/* ===== ENTREGA ===== */}
      <div className="listing-details__section">

        <div className="listing-details__section-header">
          <h3>Entrega</h3>
        </div>

        <div className="listing-details__shipping">
          {listingData.shippingAvailable && (
            <div className="listing-details__shipping-item">
              Envio disponivel
            </div>
          )}

          {listingData.localPickup && (
            <div className="listing-details__shipping-item">
              Retirada em maos
            </div>
          )}
        </div>
      </div>

      {/* ===== LOJA ===== */}
      {store && (
        <div className="listing-details__store">

          <p className="listing-details__store-name">
            Vendido por <strong>{store.name}</strong>
          </p>

          <p className="listing-details__store-rating">
            {store.rating ? `Nota: ${store.rating}` : 'Sem avaliacao'}
          </p>

        </div>
      )}
    </div>
  )
}

export default ListingDetails