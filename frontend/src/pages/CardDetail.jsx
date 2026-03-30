import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getCardById, getUsdToBrl } from '../services/pokemonTcg'

function CardDetail() {
  const { id } = useParams()
  const [card, setCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usdToBrl, setUsdToBrl] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cardData, cotacao] = await Promise.all([
          getCardById(id),
          getUsdToBrl(),
        ])
        setCard(cardData.data)
        setUsdToBrl(cotacao)
      } catch {
        setError('Erro ao carregar carta. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const formatBrl = (usd) => {
    if (!usdToBrl || !usd) return null
    return (usd * usdToBrl).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  if (loading) return <div className="card-detail__loading">Carregando...</div>
  if (error) return <div className="card-detail__error">{error}</div>
  if (!card) return null

  return (
    <div className="card-detail">
      <div className="card-detail__top">
        <div className="card-detail__image-wrap">
          <img
            className="card-detail__image"
            src={card.images.large}
            alt={card.name}
          />
        </div>

        <div className="card-detail__info">
          <h1 className="card-detail__name">{card.name}</h1>

          <div className="card-detail__meta">
            <div className="card-detail__meta-item">
              <span className="card-detail__meta-label">Set</span>
              <span className="card-detail__meta-value">{card.set.name}</span>
            </div>
            <div className="card-detail__meta-item">
              <span className="card-detail__meta-label">Número</span>
              <span className="card-detail__meta-value">{card.number}/{card.set.printedTotal}</span>
            </div>
            <div className="card-detail__meta-item">
              <span className="card-detail__meta-label">Raridade</span>
              <span className="card-detail__meta-value">{card.rarity ?? '—'}</span>
            </div>
            <div className="card-detail__meta-item">
              <span className="card-detail__meta-label">Artista</span>
              <span className="card-detail__meta-value">{card.artist ?? '—'}</span>
            </div>
          </div>

          <div className="card-detail__prices">
            <h2 className="card-detail__prices-title">Preço de referência</h2>
            <p className="card-detail__prices-note">
              Baseado no mercado internacional · cotação do dia
            </p>
            <div className="card-detail__prices-grid">
              {card.cardmarket?.prices?.averageSellPrice && (
                <div className="card-detail__price-item">
                  <span className="card-detail__price-label">Cardmarket (média)</span>
                  <span className="card-detail__price-value">
                    {formatBrl(card.cardmarket.prices.averageSellPrice)}
                  </span>
                </div>
              )}
              {card.cardmarket?.prices?.lowPrice && (
                <div className="card-detail__price-item">
                  <span className="card-detail__price-label">Cardmarket (mínimo)</span>
                  <span className="card-detail__price-value">
                    {formatBrl(card.cardmarket.prices.lowPrice)}
                  </span>
                </div>
              )}
              {card.tcgplayer?.prices?.holofoil?.market && (
                <div className="card-detail__price-item">
                  <span className="card-detail__price-label">TCGPlayer (holofoil)</span>
                  <span className="card-detail__price-value">
                    {formatBrl(card.tcgplayer.prices.holofoil.market)}
                  </span>
                </div>
              )}
              {card.tcgplayer?.prices?.normal?.market && (
                <div className="card-detail__price-item">
                  <span className="card-detail__price-label">TCGPlayer (normal)</span>
                  <span className="card-detail__price-value">
                    {formatBrl(card.tcgplayer.prices.normal.market)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="card-detail__actions">
            <button className="card-detail__btn card-detail__btn--primary">
              Ver anúncios desta carta
            </button>
            <button className="card-detail__btn card-detail__btn--secondary">
              Anunciar esta carta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardDetail