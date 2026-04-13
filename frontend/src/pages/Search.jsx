import { useState, useEffect } from 'react'
import { searchCards, getUsdToBrl, getRarities, getSets } from '../services/pokemonTcg'
import { Link } from 'react-router-dom'

function Search() {
  const [filters, setFilters] = useState({
    name: '',
    number: '',
    set: '',
    rarity: '',
  })

  const [showListingFilters, setShowListingFilters] = useState(false)
  const [listingFilters, setListingFilters] = useState({
    condition: '',
    priceMin: '',
    priceMax: '',
    certified: '',
  })

  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [usdToBrl, setUsdToBrl] = useState(null)
  const [rarities, setRarities] = useState([])
  const [sets, setSets] = useState([])
  const [searched, setSearched] = useState(false)
  const [lastSearch, setLastSearch] = useState(null)

  useEffect(() => {
  if (cards.length > 0) {
    console.log(cards.map((card) => card.set.name))
  }
}, [cards])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [cotacao, raritiesData, setsData] = await Promise.all([
          getUsdToBrl(),
          getRarities(),
          getSets(),
        ])

        setUsdToBrl(cotacao)
        setRarities(raritiesData.data)
        setSets(setsData.data)
      } catch (err) {
        console.error('Erro ao carregar filtros:', err)
        setUsdToBrl(5.8)
      }
    }

    fetchInitialData()
  }, [])

  const formatBrl = (usd) => {
    if (!usdToBrl || !usd) return null
    return (usd * usdToBrl).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    })
  }

  const handleListingFilterChange = (e) => {
    setListingFilters({
      ...listingFilters,
      [e.target.name]: e.target.value,
    })
  }

const handleSearch = async (e) => {
  e.preventDefault()

  const hasFilter = Object.values(filters).some((value) => value.trim() !== '')
  if (!hasFilter) return

  const currentSearch = JSON.stringify(filters)
  if (currentSearch === lastSearch) return

  setLoading(true)
  setError(null)
  setSearched(true)

  try {
    const data = await searchCards(filters)
    setCards(data.data)
    setLastSearch(currentSearch)
  } catch (err) {
    console.error('Erro ao buscar cartas:', err)
    setError('Erro ao buscar cartas. Tente novamente.')
  } finally {
    setLoading(false)
  }
}

  const handleClear = () => {
    setFilters({
      name: '',
      number: '',
      set: '',
      rarity: '',
    })

    setListingFilters({
      condition: '',
      priceMin: '',
      priceMax: '',
      certified: '',
    })

    setCards([])
    setSearched(false)
    setError(null)
    setShowListingFilters(false)
  }

  return (
    <div className="search">
      <div className="search__layout">
        <div className="search__main">
          <form className="search__form" onSubmit={handleSearch}>
            <div className="search__filters">
              <div className="search__filter-group">
                <label className="search__label">Nome da carta</label>
                <input
                  className="search__input"
                  type="text"
                  name="name"
                  placeholder="Ex: Charizard, Pikachu..."
                  value={filters.name}
                  onChange={handleChange}
                />
              </div>

              <div className="search__filter-group">
                <label className="search__label">Número</label>
                <input
                  className="search__input"
                  type="text"
                  name="number"
                  placeholder="Ex: 025, 4"
                  value={filters.number}
                  onChange={handleChange}
                />
              </div>

              <div className="search__filter-group">
                <label className="search__label">Set</label>
                <select
                  className="search__input"
                  name="set"
                  value={filters.set}
                  onChange={handleChange}
                >
                  <option value="">Todos</option>
                  {sets.map((setItem) => (
                    <option key={setItem.id} value={setItem.name}>
                      {setItem.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="search__filter-group">
                <label className="search__label">Raridade</label>
                <select
                  className="search__input"
                  name="rarity"
                  value={filters.rarity}
                  onChange={handleChange}
                >
                  <option value="">Todas</option>
                  {rarities.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="search__form-actions">
              <button
                className="search__btn search__btn--ghost"
                type="button"
                onClick={() => setShowListingFilters(!showListingFilters)}
              >
                {showListingFilters ? 'Fechar filtros' : 'Filtros'}
              </button>

              <button
                className="search__btn search__btn--primary"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>

              <button
                className="search__btn search__btn--ghost"
                type="button"
                onClick={handleClear}
              >
                Limpar
              </button>
            </div>
          </form>

          {error && <p className="search__error">{error}</p>}

          {cards.length > 0 && (
            <div className="search__results">
              <p className="search__count">{cards.length} cartas encontradas</p>

              <div className="search__grid">
                {cards.map((card) => (
                  <Link to={`/card/${card.id}`} key={card.id} className="search__card">
                    <img
                      className="search__card-img"
                      src={card.images.small}
                      alt={card.name}
                    />

                    <div className="search__card-info">
                      <p className="search__card-name">{card.name}</p>
                      <p className="search__card-set">{card.set.name}</p>
                      <p className="search__card-number">
                        #{card.number}/{card.set.printedTotal}
                      </p>

                      {card.rarity && (
                        <p className="search__card-rarity">{card.rarity}</p>
                      )}

                      {card.cardmarket?.prices?.averageSellPrice && (
                        <p className="search__card-price">
                          Ref: {formatBrl(card.cardmarket.prices.averageSellPrice)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {!loading && searched && cards.length === 0 && (
            <p className="search__empty">Nenhuma carta encontrada com esses filtros.</p>
          )}
        </div>

        {showListingFilters && (
          <aside className="search__sidebar">
            <div className="search__listing-filters">
              <h3 className="search__listing-title">Filtros do anúncio</h3>

              <div className="search__sidebar-fields">
                <div className="search__filter-group">
                  <label className="search__label">Condição</label>
                  <select
                    className="search__input"
                    name="condition"
                    value={listingFilters.condition}
                    onChange={handleListingFilterChange}
                  >
                    <option value="">Todas</option>
                    <option value="NM">Near Mint</option>
                    <option value="LP">Lightly Played</option>
                    <option value="MP">Moderately Played</option>
                    <option value="HP">Heavily Played</option>
                    <option value="DMG">Damaged</option>
                  </select>
                </div>

                <div className="search__filter-group">
                  <label className="search__label">Preço mínimo</label>
                  <input
                    className="search__input"
                    type="number"
                    name="priceMin"
                    placeholder="Ex: 50"
                    value={listingFilters.priceMin}
                    onChange={handleListingFilterChange}
                  />
                </div>

                <div className="search__filter-group">
                  <label className="search__label">Preço máximo</label>
                  <input
                    className="search__input"
                    type="number"
                    name="priceMax"
                    placeholder="Ex: 500"
                    value={listingFilters.priceMax}
                    onChange={handleListingFilterChange}
                  />
                </div>

                <div className="search__filter-group">
                  <label className="search__label">Certificada</label>
                  <select
                    className="search__input"
                    name="certified"
                    value={listingFilters.certified}
                    onChange={handleListingFilterChange}
                  >
                    <option value="">Todas</option>
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </select>
                      
                
                 <div className="search__filter-group">
                <label className="search__label">Indioma</label>
                  <select
                      className="search__input"
                      name="language"
                      value={listingFilters.language}
                      onChange={handleListingFilterChange}
>                   
                    <option value="">Todos</option>
                    <option value="portugues">Português</option>
                    <option value="ingles">Inglês</option>
                    <option value="japones">Japonês</option>
                    <option value="espanhol">Espanhol</option>
                    <option value="outros">Outros</option>
                  </select>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

export default Search