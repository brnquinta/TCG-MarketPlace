import { useState, useEffect } from 'react'
import { searchCards, getUsdToBrl, getRarities } from '../services/pokemonTcg'
import { Link } from 'react-router-dom'

function Search() {
  const [filters, setFilters] = useState({
    name: '',
    number: '',
    set: '',
    rarity: '',
  })
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [usdToBrl, setUsdToBrl] = useState(null)
  const [rarities, setRarities] = useState([])
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [cotacao, raritiesData] = await Promise.all([
          getUsdToBrl(),
          getRarities(),
        ])
        setUsdToBrl(cotacao)
        setRarities(raritiesData.data)
      } catch {
        setUsdToBrl(5.8)
      }
    }
    fetchInitialData()
  }, [])

  const formatBrl = (usd) => {
    if (!usdToBrl || !usd) return null
    return (usd * usdToBrl).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    const hasFilter = Object.values(filters).some((v) => v.trim() !== '')
    if (!hasFilter) return

    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const data = await searchCards(filters)
      setCards(data.data)
    } catch {
      setError('Erro ao buscar cartas. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setFilters({ name: '', number: '', set: '', rarity: '' })
    setCards([])
    setSearched(false)
    setError(null)
  }

  return (
    <div className="search">
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
            <input
              className="search__input"
              type="text"
              name="set"
              placeholder="Ex: Scarlet & Violet"
              value={filters.set}
              onChange={handleChange}
            />
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
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="search__form-actions">
          <button className="search__btn search__btn--primary" type="submit" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
          <button className="search__btn search__btn--ghost" type="button" onClick={handleClear}>
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
                  <p className="search__card-number">#{card.number}/{card.set.printedTotal}</p>
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
  )
}

export default Search