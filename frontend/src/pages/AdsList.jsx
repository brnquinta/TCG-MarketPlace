import { Link } from "react-router-dom"
import { useState, useMemo } from "react"

function AdsList() {
  const [viewMode, setViewMode] = useState("grid")

  const [filters, setFilters] = useState({
    search: "",
    minPrice: "",
    maxPrice: "",
    condition: "",
    certified: false,
    store:"",
  })

  const listings = [
    {
      id: "1",
      title: "Charizard",
      image: "https://images.pokemontcg.io/base1/4.png",
      price: 199.9,
      condition: "NM",
      number: "4",
      set: "Base Set",
      certified: true,
      gradingCompany: "PSA",
      grade: "10",
      acceptsOffer: true,
      quantity: 2,
      city: "Rio de Janeiro",
      state: "RJ",
      store: {
        id: "store1",
        name: "Bruno TCG",
        rating: 4.8,
      },
    },
    {
      id: "2",
      title: "Blastoise",
      image: "https://images.pokemontcg.io/base1/2.png",
      price: 120,
      condition: "LP",
      number: "2",
      set: "Base Set",
      certified: false,
      acceptsOffer: false,
      quantity: 1,
      city: "São Paulo",
      state: "SP",
      store: {
        id: "store2",
        name: "Cards SP",
        rating: 4.5,
      },
    },
  ]

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (
        filters.search &&
        !item.title.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false
      }

      if (filters.minPrice && item.price < Number(filters.minPrice)) {
        return false
      }

      if (filters.maxPrice && item.price > Number(filters.maxPrice)) {
        return false
      }

      if (filters.condition && item.condition !== filters.condition) {
        return false
      }

      if (filters.certified && !item.certified) {
        return false
      }

   if (
       filters.store &&
        !item.store.name.toLowerCase().includes(filters.store.toLowerCase())
      ) {
          return false
        }

      return true
    })
  }, [filters, listings])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

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
                to={`/listing/${item.id}`}
                key={item.id}
                className="ads__card"
              >
                <div className="ads__image-box">
                  <img src={item.image} alt={item.title} className="ads__image" />
                </div>

                <div className="ads__info">
                  <div className="ads__top">
                    <p className="ads__title">{item.title}</p>

                    {item.certified && (
                      <span className="ads__badge">
                        {item.gradingCompany} {item.grade}
                      </span>
                    )}
                  </div>

                  <p className="ads__meta">
                    {item.set} • #{item.number} • {item.condition}
                  </p>

                  <div className="ads__badges">
                    {item.acceptsOffer && (
                      <span className="ads__badge">Aceita oferta</span>
                    )}

                    {item.quantity > 1 && (
                      <span className="ads__badge">
                        {item.quantity} disponíveis
                      </span>
                    )}
                  </div>

                  <div className="ads__divider" />

                  <div className="ads__store">
                    <span>{item.store.name}</span>
                    <span>★ {item.store.rating}</span>
                  </div>

                  <p className="ads__location">
                    {item.city} - {item.state}
                  </p>
                </div>

                <p className="ads__price">
                  R$ {item.price.toFixed(2)}
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