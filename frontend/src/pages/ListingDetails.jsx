import { useParams } from "react-router-dom"
import { useState } from "react"
import { useCart } from "../context/CartContext"

const listings = [
  {
    id: "1",
    cardSnapshot: {
      name: "Charizard",
      number: "4",
      rarity: "Rare Holo",
      imageLarge: "https://images.pokemontcg.io/base1/4_hires.png",
      setName: "Base Set",
    },
    listingData: {
      price: 199.9,
      condition: "NM",
      language: "EN",
      quantity: 2,
      certified: true,
      gradingCompany: "PSA",
      grade: "10",
      acceptsOffer: true,
      description: "Carta em perfeito estado, sem marcas visíveis.",
      defects: "Nenhum defeito relevante.",
      city: "Rio de Janeiro",
      state: "RJ",
      shippingAvailable: true,
      localPickup: true,
      photos: {
        front90: "https://images.pokemontcg.io/base1/4.png",
        back90: "https://images.pokemontcg.io/base1/4.png",
        front45: "https://images.pokemontcg.io/base1/4.png",
        back45: "https://images.pokemontcg.io/base1/4.png",
      },
    },
    store: {
      id: "store-1",
      name: "Bruno TCG",
      rating: 4.8,
    },
  },
]

function ListingDetails() {
  const { id } = useParams()
  const { addToCart } = useCart()

  const listing = listings.find((item) => item.id === id)

  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)

  if (!listing) return <p>Anúncio não encontrado</p>

  const { cardSnapshot, listingData, store } = listing

  const photosArray = Object.values(listingData.photos)

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

  const handleAddToCart = () => {
    addToCart(listing)
    setAddedToCart(true)

    setTimeout(() => {
      setAddedToCart(false)
    }, 4000)
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
            <p>Condição: {listingData.condition}</p>
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
            📍 {listingData.city} - {listingData.state}
          </p>

        </div>
      </div>

      {/* ===== CAROUSEL ===== */}
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

      {/* ===== DESCRIÇÃO ===== */}
      <div className="listing-details__section">

        <div className="listing-details__section-header">
          <h3>Descrição</h3>
        </div>

        <p className="listing-details__text">
          {listingData.description}
        </p>

        <h4 className="listing-details__subtitle">
          Defeitos
        </h4>

        <p className="listing-details__text">
          {listingData.defects}
        </p>

      </div>

      {/* ===== ENTREGA ===== */}
      <div className="listing-details__section">

        <div className="listing-details__section-header">
          <h3>Entrega</h3>
        </div>

        <div className="listing-details__shipping">
          {listingData.shippingAvailable && (
            <div className="listing-details__shipping-item">
              Envio disponível
            </div>
          )}

          {listingData.localPickup && (
            <div className="listing-details__shipping-item">
              Retirada em mãos
            </div>
          )}
        </div>
      </div>

      {/* ===== LOJA ===== */}
      <div className="listing-details__store">

        <p className="listing-details__store-name">
          Vendido por <strong>{store.name}</strong>
        </p>

        <p className="listing-details__store-rating">
          ⭐ {store.rating}
        </p>

      </div>
    </div>
  )
}

export default ListingDetails