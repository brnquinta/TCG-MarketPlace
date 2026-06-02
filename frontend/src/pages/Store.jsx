import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { storeAPI } from '../services/api'

const CONDITION_LABELS = {
  NM: 'Near Mint',
  LP: 'Lightly Played',
  MP: 'Moderately Played',
  HP: 'Heavily Played',
  DM: 'Damaged',
}

const LANGUAGE_LABELS = {
  'PT-BR': 'Português',
  EN: 'Inglês',
  JP: 'Japonês',
  ES: 'Espanhol',
  FR: 'Francês',
  DE: 'Alemão',
  IT: 'Italiano',
  KO: 'Coreano',
  ZH: 'Chinês',
}

function Store() {
  const { slug } = useParams()
  const [store, setStore] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchStore() {
      try {
        setLoading(true)
        const data = await storeAPI.getPublicBySlug(slug)
        setStore(data.store)
        setListings(data.listings)
      } catch (err) {
        console.error('Erro ao carregar loja:', err)
        setError('Loja não encontrada')
      } finally {
        setLoading(false)
      }
    }

    fetchStore()
  }, [slug])

  function formatPrice(price) {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  if (loading) {
    return (
      <section className="store">
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#6b7280' }}>
          Carregando loja...
        </div>
      </section>
    )
  }

  if (error || !store) {
    return (
      <section className="store">
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#6b7280' }}>
          {error || 'Loja não encontrada'}
        </div>
      </section>
    )
  }

  return (
    <section className="store">
      <div className="store__banner">
        {store.bannerUrl ? (
          <img
            className="store__banner-image"
            src={store.bannerUrl}
            alt={`Banner da loja ${store.name}`}
          />
        ) : (
          <div className="store__banner-placeholder" />
        )}
      </div>

      <div className="store__header">
        <div className="store__identity">
          <div className="store__logo-wrapper">
            {store.logoUrl ? (
              <img
                className="store__logo"
                src={store.logoUrl}
                alt={`Logo da loja ${store.name}`}
              />
            ) : (
              <div className="store__logo-placeholder">
                {store.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="store__info">
            <h1 className="store__title">{store.name}</h1>
            <p className="store__slug">@{store.slug}</p>
            <p className="store__location">
              {store.location.city} - {store.location.state}
            </p>
          </div>
        </div>

        <div className="store__stats">
          <div className="store__stat">
            <span className="store__stat-value">{listings.length}</span>
            <span className="store__stat-label">Anúncios</span>
          </div>

          <div className="store__stat">
            <span className="store__stat-value">{store.stats.totalSales}</span>
            <span className="store__stat-label">Vendas</span>
          </div>

          <div className="store__stat">
            <span className="store__stat-value store__stat-value--rating">
              <span className="store__rating-star">★</span>
              {store.rating.average || '0.0'}
            </span>
            <span className="store__stat-label">
              {store.rating.reviewsCount} avaliações
            </span>
          </div>
        </div>
      </div>

      <div className="store__content">
        <aside className="store__sidebar">
          <div className="store__card">
            <h2 className="store__section-title">Sobre a loja</h2>
            <p className="store__description">{store.description || 'Loja ainda não possui descrição.'}</p>
          </div>

          <div className="store__card">
            <h2 className="store__section-title">Informações</h2>
            <ul className="store__details">
              <li className="store__detail-item">
                <span className="store__detail-label">Cidade</span>
                <span className="store__detail-value">{store.location.city || '—'}</span>
              </li>
              <li className="store__detail-item">
                <span className="store__detail-label">Estado</span>
                <span className="store__detail-value">{store.location.state || '—'}</span>
              </li>
            </ul>
          </div>

          <div className="store__card">
            <h2 className="store__section-title">Ações</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                className="store__listing-button"
                style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }}
                disabled
              >
                Avaliar loja
              </button>
              <button
                type="button"
                className="store__listing-button"
                style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }}
                disabled
              >
                Comentar
              </button>
            </div>
          </div>
        </aside>

        <div className="store__main">
          <div className="store__main-header">
            <h2 className="store__section-title">Anúncios da loja</h2>
          </div>

          {listings.length > 0 ? (
            <div className="store__grid">
              {listings.map((listing) => (
                <article key={listing._id} className="store__listing-card">
                  <div className="store__listing-image-wrapper">
                    <img
                      className="store__listing-image"
                      src={listing.cardSnapshot.imageSmall || listing.photos.front90}
                      alt={listing.cardSnapshot.name}
                    />
                  </div>

                  <div className="store__listing-content">
                    <h3 className="store__listing-title">{listing.cardSnapshot.name}</h3>

                    <p className="store__listing-price">
                      {formatPrice(listing.listingData.price)}
                    </p>

                    <ul className="store__listing-meta">
                      <li>{CONDITION_LABELS[listing.listingData.condition] || listing.listingData.condition}</li>
                      <li>{LANGUAGE_LABELS[listing.listingData.language] || listing.listingData.language}</li>
                      <li>{listing.listingData.certified ? 'Certificada' : 'Não certificada'}</li>
                    </ul>

                    <Link
                      to={`/listing/${listing._id}`}
                      className="store__listing-button"
                    >
                      Ver carta
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="store__empty">
              <h3 className="store__empty-title">Nenhum anúncio disponível</h3>
              <p className="store__empty-text">
                Esta loja ainda não possui cartas anunciadas.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Store
