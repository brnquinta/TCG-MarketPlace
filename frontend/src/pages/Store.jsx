import { Link, useParams } from 'react-router-dom'

function Store() {
  const { userId } = useParams()

  const store = {
    id: userId,
    name: 'Loja do Bruno TCG',
    slug: 'loja-do-bruno-tcg',
    logoUrl: '',
    bannerUrl: '',
    description:
      'Loja focada em cartas Pokémon para coleção e competitivo, com atenção especial para cartas raras e itens bem conservados.',
    location: {
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    stats: {
      listingsCount: 6,
      salesCount: 18,
    },
  }

  const listings = [
    {
      id: '1',
      name: 'Charizard ex',
      imageUrl: 'https://images.pokemontcg.io/sv3pt5/183_hires.png',
      price: 'R$ 299,90',
      condition: 'Near Mint',
      language: 'Português',
      certified: true,
    },
    {
      id: '2',
      name: 'Blastoise ex',
      imageUrl: 'https://images.pokemontcg.io/sv3pt5/184_hires.png',
      price: 'R$ 219,90',
      condition: 'Excellent',
      language: 'Inglês',
      certified: false,
    },
    {
      id: '3',
      name: 'Venusaur ex',
      imageUrl: 'https://images.pokemontcg.io/sv3pt5/182_hires.png',
      price: 'R$ 189,90',
      condition: 'Near Mint',
      language: 'Português',
      certified: false,
    },
  ]

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
            <span className="store__stat-value">{store.stats.listingsCount}</span>
            <span className="store__stat-label">Anúncios</span>
          </div>

          <div className="store__stat">
            <span className="store__stat-value">{store.stats.salesCount}</span>
            <span className="store__stat-label">Vendas</span>
          </div>
        </div>
      </div>

      <div className="store__content">
        <aside className="store__sidebar">
          <div className="store__card">
            <h2 className="store__section-title">Sobre a loja</h2>
            <p className="store__description">{store.description}</p>
          </div>

          <div className="store__card">
            <h2 className="store__section-title">Informações</h2>
            <ul className="store__details">
              <li className="store__detail-item">
                <span className="store__detail-label">Cidade</span>
                <span className="store__detail-value">{store.location.city}</span>
              </li>
              <li className="store__detail-item">
                <span className="store__detail-label">Estado</span>
                <span className="store__detail-value">{store.location.state}</span>
              </li>
            </ul>
          </div>
        </aside>

        <div className="store__main">
          <div className="store__main-header">
            <h2 className="store__section-title">Anúncios da loja</h2>
          </div>

          {listings.length > 0 ? (
            <div className="store__grid">
              {listings.map((listing) => (
                <article key={listing.id} className="store__listing-card">
                  <div className="store__listing-image-wrapper">
                    <img
                      className="store__listing-image"
                      src={listing.imageUrl}
                      alt={listing.name}
                    />
                  </div>

                  <div className="store__listing-content">
                    <h3 className="store__listing-title">{listing.name}</h3>

                    <p className="store__listing-price">{listing.price}</p>

                    <ul className="store__listing-meta">
                      <li>{listing.condition}</li>
                      <li>{listing.language}</li>
                      <li>{listing.certified ? 'Certificada' : 'Não certificada'}</li>
                    </ul>

                    <Link
                      to={`/card/${listing.id}`}
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