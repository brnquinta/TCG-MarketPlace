import { useState, useEffect } from 'react'
import { searchCards, getUsdToBrl } from '../services/pokemonTcg'
import { Link } from 'react-router-dom'

function Search() {
  const [query, setQuery] = useState('')
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [usdToBrl, setUsdToBrl] = useState(null)

  useEffect(() => {
    const fetchCotacao = async () => {
      try {
        const cotacao = await getUsdToBrl()
        setUsdToBrl(cotacao)
      } catch {
        setUsdToBrl(5.8)
      }
    }
    fetchCotacao()
  }, [])

  const formatBrl = (usd) => {
    if (!usdToBrl || !usd) return null
    const brl = usd * usdToBrl
    return brl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)

    try {
      const data = await searchCards(query)
      setCards(data.data)
    } catch {
      setError('Erro ao buscar cartas. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="search">
      <form className="search__form" onSubmit={handleSearch}>
        <input
          className="search__input"
          type="text"
          placeholder="Buscar carta ex: Charizard, Pikachu..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="search__btn" type="submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
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

      {!loading && cards.length === 0 && query && (
        <p className="search__empty">Nenhuma carta encontrada para "{query}"</p>
      )}
    </div>
  )
}

export default Search