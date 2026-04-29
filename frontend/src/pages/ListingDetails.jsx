import { useParams } from "react-router-dom"
import { useState } from "react"

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
      name: "Bruno TCG",
      rating: 4.8,
    },
  },
]

function ListingDetails() {
  const { id } = useParams()
  const listing = listings.find((item) => item.id === id)

  if (!listing) return <p>Anúncio não encontrado</p>

  const { cardSnapshot, listingData, store } = listing

  const photosArray = Object.values(listingData.photos)

  const [currentPhoto, setCurrentPhoto] = useState(0)

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

  return (
    <div className="listingDetails">

      {/* ===== TOPO ===== */}
      <div className="listingDetails__top">

        <div className="listingDetails__gallery">
          <img
            src={cardSnapshot.imageLarge}
            alt={cardSnapshot.name}
            className="listingDetails__main-image"
          />
        </div>

        <div className="listingDetails__info">
          <h1>{cardSnapshot.name}</h1>

          <p>
            {cardSnapshot.setName} • #{cardSnapshot.number} • {cardSnapshot.rarity}
          </p>

          <h2>R$ {listingData.price.toFixed(2)}</h2>

          <p>Condição: {listingData.condition}</p>
          <p>Idioma: {listingData.language}</p>
          <p>Quantidade: {listingData.quantity}</p>

          {listingData.certified && (
            <p>
              {listingData.gradingCompany} {listingData.grade}
            </p>
          )}

          {listingData.acceptsOffer && <p>Aceita ofertas</p>}

          <p>
            📍 {listingData.city} - {listingData.state}
          </p>
        </div>
      </div>

      {/* ===== CAROUSEL DE FOTOS ===== */}
      <div className="listingDetails__section">
        <h3>Fotos do item</h3>

        <div className="listingDetails__carousel">

          <button
            className="listingDetails__carousel-btn"
            onClick={prevPhoto}
            disabled={currentPhoto === 0}
          >
            ←
          </button>

          <img
            src={photosArray[currentPhoto]}
            className="listingDetails__carousel-image"
          />

          <button
            className="listingDetails__carousel-btn"
            onClick={nextPhoto}
            disabled={currentPhoto === photosArray.length - 1}
          >
            →
          </button>
        </div>

        <p className="listingDetails__carousel-counter">
          {currentPhoto + 1} / {photosArray.length}
        </p>
      </div>

      {/* ===== DESCRIÇÃO ===== */}
      <div className="listingDetails__section">
        <h3>Descrição</h3>
        <p>{listingData.description}</p>

        <h4>Defeitos</h4>
        <p>{listingData.defects}</p>
      </div>

      {/* ===== ENTREGA ===== */}
      <div className="listingDetails__section">
        <h3>Entrega</h3>

        {listingData.shippingAvailable && <p>Envio disponível</p>}
        {listingData.localPickup && <p>Retirada em mãos</p>}
      </div>

      {/* ===== LOJA ===== */}
      <div className="listingDetails__store">
        <p>
          Vendido por <strong>{store.name}</strong>
        </p>
        <p>⭐ {store.rating}</p>
      </div>
    </div>
  )
}

export default ListingDetails