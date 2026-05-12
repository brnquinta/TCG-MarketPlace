import { Link } from "react-router-dom"
import { useState, useEffect } from "react"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function AdsList() {
  const [viewMode, setViewMode] = useState("grid")
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    search: "",
    minPrice: "",
    maxPrice: "",
    condition: "",
    certified: false,
    store: "",
  })

  useEffect(() => {
    async function fetchListings() {
      try {
        const response = await fetch(`${API_URL}/listings`)
        const data = await response.json()
        setListings(data.listings || [])
      } catch (err) {
        console.error('Erro ao buscar anuncios:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [])

  const filteredListings = listings.filter((item) => {
    if (filters.search && !item.cardSnapshot?.name?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }

    if (filters.minPrice && item.listingData?.price < Number(filters.minPrice)) {
      return false
    }

    if (filters.maxPrice && item.listingData?.price > Number(filters.maxPrice)) {
      return false
    }

    if (filters.condition && item.listingData?.condition !== filters.condition) {
      return false
    }

    if (filters.certified && !item.listingData?.certified) {
      return false
    }

    if (filters.store && !item.storeId?.name?.toLowerCase().includes(filters.store.toLowerCase())) {
      return false
    }

    return true
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  if (loading) return <div className="ads">Carregando...</div>

  return (
    <div className="ads">
      <div className="ads__layout">

        {/* FILTROS */}
        <div className="ads__filters">
          <input
            type="text"
            name="search"
            placeholder="Buscar carta..."
            value={filters.search}
            onChange={handleChange}
          />

          <input
            type="number"
            name="minPrice"
            placeholder="Preço mín"
            value={filters.minPrice}
            onChange={handleChange}
          />

          <input
            type="number"
            name="maxPrice"
            placeholder="Preço máx"
            value={filters.maxPrice}
            onChange={handleChange}
          />

          <select
            name="condition"
            value={filters.condition}
            onChange={handleChange}
          >
            <option value="">Condição</option>
            <option value="NM">NM</option>
            <option value="LP">LP</option>
          </select>

          <label className=" ads__label">
            <input
              type="checkbox"
              name="certified"
              checked={filters.certified}
              onChange={handleChange}
            />
            Certificado
          </label>
                               
          <input
            type="text"
            name="store"
            placeholder="Loja"
            value={filters.store}
            onChange={handleChange}
          />
        </div>

        <div className="ads__toolbar">
          <button
            className={`ads__view-btn ${
              viewMode === "grid" ? "ads__view-btn--active" : ""
            }`}
            onClick={() => setViewMode("grid")}
          >
            Grid
          </button>

          <button
            className={`ads__view-btn ${
              viewMode === "list" ? "ads__view-btn--active" : ""
            }`}
            onClick={() => setViewMode("list")}
          >
            Lista
          </button>
        </div>

        <section className="ads__results-box">
          <div className={`ads__grid ads__grid--${viewMode}`}>
            {filteredListings.map((item) => (
              <Link
                to={`/listing/${item._id}`}
                key={item._id}
                className="ads__card"
              >
                <div className="ads__image-box">
                  <img 
                    src={item.cardSnapshot?.imageLarge || item.cardSnapshot?.imageSmall} 
                    alt={item.cardSnapshot?.name} 
                    className="ads__image" 
                  />
                </div>

                <div className="ads__info">
                  <div className="ads__top">
                    <p className="ads__title">{item.cardSnapshot?.name}</p>

                    {item.listingData?.certified && (
                      <span className="ads__badge">
                        {item.listingData.gradingCompany} {item.listingData.grade}
                      </span>
                    )}
                  </div>

                  <p className="ads__meta">
                    {item.cardSnapshot?.setName} • #{item.cardSnapshot?.number} • {item.listingData?.condition}
                  </p>

                  <div className="ads__badges">
                    {item.listingData?.acceptsOffer && (
                      <span className="ads__badge">Aceita oferta</span>
                    )}

                    {item.listingData?.quantity > 1 && (
                      <span className="ads__badge">
                        {item.listingData?.quantity} disponíveis
                      </span>
                    )}
                  </div>

                  <div className="ads__divider" />

                  <div className="ads__store">
                    <span>{item.storeId?.name || 'Loja'}</span>
                    <span>{item.storeId?.rating ? `★ ${item.storeId.rating}` : ''}</span>
                  </div>

                  <p className="ads__location">
                    {item.listingData?.city} - {item.listingData?.state}
                  </p>
                </div>

                <p className="ads__price">
                  R$ {item.listingData?.price?.toFixed(2)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdsList