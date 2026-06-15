import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../hooks/useStore'
import { useApiStore } from '../hooks/useApiStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const API_BASE = API_URL.replace(/\/api$/, '')

function StoreDashboard() {
  const { store, loading } = useStore()
  const { fetchListingsFromBackend, deleteListingOnBackend } = useApiStore()

  const [listings, setListings] = useState([])
  const [listingsLoading, setListingsLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    condition: '',
  })

  useEffect(() => {
    async function loadListings() {
      try {
        const data = await fetchListingsFromBackend()
        setListings(data)
      } catch (err) {
        console.error('Erro ao buscar anuncios:', err)
      } finally {
        setListingsLoading(false)
      }
    }

    if (store) {
      loadListings()
    }
  }, [store, fetchListingsFromBackend])

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (filters.search && !item.cardSnapshot?.name?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      if (filters.status && item.status !== filters.status) {
        return false
      }
      if (filters.condition && item.listingData?.condition !== filters.condition) {
        return false
      }
      return true
    })
  }, [listings, filters])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleDelete = async (listingId) => {
    if (!confirm('Tem certeza que deseja excluir este anuncio?')) return
    try {
      await deleteListingOnBackend(listingId)
      setListings((prev) => prev.filter((l) => l._id !== listingId))
    } catch (err) {
      console.error('Erro ao excluir:', err)
    }
  }

  const getStatusLabel = (status) => {
    const map = {
      active: 'Ativo',
      draft: 'Rascunho',
      sold: 'Vendido',
      inactive: 'Inativo',
      removed: 'Removido',
    }
    return map[status] || status
  }

  const getStatusClass = (status) => {
    const map = {
      active: 'store-dashboard__listing-status--active',
      draft: 'store-dashboard__listing-status--draft',
      sold: 'store-dashboard__listing-status--sold',
      inactive: 'store-dashboard__listing-status--inactive',
    }
    return map[status] || ''
  }

  if (loading) {
    return (
      <section className="store-dashboard">
        <p>Carregando...</p>
      </section>
    )
  }

  if (!store) {
    return (
      <section className="store-dashboard">
        <p>Loja nao encontrada</p>
      </section>
    )
  }

  const nextSteps = [
    {
      id: 1,
      title: 'Completar dados da loja',
      description: 'Revise nome, slug, logo, descricao e localizacao.',
      actionLabel: 'Editar loja',
      actionPath: '/store/edit',
    },
    {
      id: 2,
      title: 'Ativar conta para vender',
      description: 'Preencha CPF/CNPJ, telefone, endereco e dados de repasse.',
      actionLabel: 'Fazer onboarding',
      actionPath: '/store/onboarding',
    },
  ]

  const getStoreStatusLabel = (status) => {
    if (status === 'active') return 'Ativa'
    if (status === 'draft') return 'Em configuracao'
    return 'Indefinido'
  }

  const getOnboardingStatusLabel = (status) => {
    if (status === 'approved') return 'Aprovado'
    if (status === 'pending') return 'Pendente'
    return 'Nao iniciado'
  }

  return (
    <section className="store-dashboard">
      <div className="store-dashboard__header">
        <div className="store-dashboard__header-content">
          <p className="store-dashboard__eyebrow">Painel da loja</p>
          <h1 className="store-dashboard__title">{store.name}</h1>
          <p className="store-dashboard__subtitle">
            Gerencie sua loja, acompanhe o status da conta e publique seus anuncios.
          </p>
          <div className="store-dashboard__rating">
            <span className="store-dashboard__rating-star">&#9733;</span>
            <span className="store-dashboard__rating-value">
              {store.rating.average}
            </span>
            <span className="store-dashboard__rating-count">
              ({store.rating.reviewsCount} reviews)
            </span>
          </div>
        </div>
        <div className="store-dashboard__header-actions">
          <Link
            to={`/store/${store.slug}`}
            className="store-dashboard__button store-dashboard__button--secondary"
          >
            Ver loja publica
          </Link>
          <Link
            to="/new-listing"
            className="store-dashboard__button store-dashboard__button--primary"
          >
            Novo anuncio
          </Link>
        </div>
      </div>

      <div className="store-dashboard__layout">
        <aside className="store-dashboard__sidebar">
          <div className="store-dashboard__card">
            <h2 className="store-dashboard__card-title">Resumo da loja</h2>
            <ul className="store-dashboard__details">
              <li className="store-dashboard__detail-item">
                <span className="store-dashboard__detail-label">Nome</span>
                <span className="store-dashboard__detail-value">{store.name}</span>
              </li>
              <li className="store-dashboard__detail-item">
                <span className="store-dashboard__detail-label">Slug</span>
                <span className="store-dashboard__detail-value">@{store.slug}</span>
              </li>
              <li className="store-dashboard__detail-item">
                <span className="store-dashboard__detail-label">Localizacao</span>
                <span className="store-dashboard__detail-value">
                  {store.location.city} - {store.location.state}
                </span>
              </li>
              <li className="store-dashboard__detail-item">
                <span className="store-dashboard__detail-label">Status da loja</span>
                <span className="store-dashboard__detail-value">
                  {getStoreStatusLabel(store.status)}
                </span>
              </li>
              <li className="store-dashboard__detail-item">
                <span className="store-dashboard__detail-label">Onboarding</span>
                <span className="store-dashboard__detail-value">
                  {getOnboardingStatusLabel(store.onboardingStatus)}
                </span>
              </li>
            </ul>
            <Link to="/store/edit" className="store-dashboard__link-button">
              Editar informacoes da loja
            </Link>
          </div>
          <div className="store-dashboard__card">
            <h2 className="store-dashboard__card-title">Sobre a loja</h2>
            <p className="store-dashboard__description">{store.description}</p>
          </div>
        </aside>

        <div className="store-dashboard__main">
          <div className="store-dashboard__stats">
            <article className="store-dashboard__stat-card">
              <span className="store-dashboard__stat-value">
                {store.stats.activeListings}
              </span>
              <span className="store-dashboard__stat-label">Anuncios ativos</span>
            </article>
            <article className="store-dashboard__stat-card">
              <span className="store-dashboard__stat-value">
                {store.stats.totalSales}
              </span>
              <span className="store-dashboard__stat-label">Vendas</span>
            </article>
            <article className="store-dashboard__stat-card">
              <span className="store-dashboard__stat-value">
                {store.stats.totalViews}
              </span>
              <span className="store-dashboard__stat-label">Visualizacoes</span>
            </article>
          </div>

          <div className="store-dashboard__card">
            <div className="store-dashboard__section-header">
              <h2 className="store-dashboard__card-title">Proximos passos</h2>
            </div>
            <div className="store-dashboard__steps">
              {nextSteps.map((step) => (
                <article key={step.id} className="store-dashboard__step">
                  <div className="store-dashboard__step-content">
                    <h3 className="store-dashboard__step-title">{step.title}</h3>
                    <p className="store-dashboard__step-description">{step.description}</p>
                  </div>
                  <Link to={step.actionPath} className="store-dashboard__step-button">
                    {step.actionLabel}
                  </Link>
                </article>
              ))}
            </div>
          </div>

          <div className="store-dashboard__card">
            <div className="store-dashboard__section-header">
              <h2 className="store-dashboard__card-title">Meus anuncios</h2>
              <Link to="/new-listing" className="store-dashboard__text-link">
                Criar anuncio
              </Link>
            </div>

            <div className="store-dashboard__filters">
              <input
                type="text"
                name="search"
                placeholder="Buscar carta..."
                value={filters.search}
                onChange={handleFilterChange}
                className="store-dashboard__filter-input"
              />
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="store-dashboard__filter-select"
              >
                <option value="">Status</option>
                <option value="active">Ativo</option>
                <option value="draft">Rascunho</option>
                <option value="sold">Vendido</option>
                <option value="inactive">Inativo</option>
              </select>
              <select
                name="condition"
                value={filters.condition}
                onChange={handleFilterChange}
                className="store-dashboard__filter-select"
              >
                <option value="">Condicao</option>
                <option value="NM">NM</option>
                <option value="LP">LP</option>
                <option value="MP">MP</option>
                <option value="HP">HP</option>
                <option value="DM">DM</option>
              </select>
            </div>

            {listingsLoading ? (
              <p className="store-dashboard__empty-text">Carregando anuncios...</p>
            ) : filteredListings.length > 0 ? (
              <div className="store-dashboard__listings">
                {filteredListings.map((listing) => (
                  <article key={listing._id} className="store-dashboard__listing-card">
                    <Link
                      to={`/listing/${listing._id}`}
                      className="store-dashboard__listing-image"
                    >
                      <img
                        src={listing.cardSnapshot?.imageSmall}
                        alt={listing.cardSnapshot?.name}
                      />
                    </Link>

                    <div className="store-dashboard__listing-info">
                      <Link
                        to={`/listing/${listing._id}`}
                        className="store-dashboard__listing-name"
                      >
                        {listing.cardSnapshot?.name}
                      </Link>
                      <p className="store-dashboard__listing-meta">
                        {listing.cardSnapshot?.setName} &bull; #{listing.cardSnapshot?.number} &bull; {listing.listingData?.condition}
                      </p>
                      <p className="store-dashboard__listing-location">
                        {listing.listingData?.city} - {listing.listingData?.state}
                      </p>
                    </div>

                    <div className="store-dashboard__listing-right">
                      <p className="store-dashboard__listing-price">
                        R$ {listing.listingData?.price?.toFixed(2)}
                      </p>
                      <span className={`store-dashboard__listing-status ${getStatusClass(listing.status)}`}>
                        {getStatusLabel(listing.status)}
                      </span>
                      <div className="store-dashboard__listing-actions">
                        <Link
                          to={`/listing/${listing._id}`}
                          className="store-dashboard__listing-action store-dashboard__listing-action--view"
                        >
                          Ver
                        </Link>
                        <button
                          className="store-dashboard__listing-action store-dashboard__listing-action--delete"
                          onClick={() => handleDelete(listing._id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : listings.length > 0 ? (
              <div className="store-dashboard__empty">
                <h3 className="store-dashboard__empty-title">
                  Nenhum anuncio encontrado com esses filtros
                </h3>
                <p className="store-dashboard__empty-text">
                  Tente alterar os filtros ou crie um novo anuncio.
                </p>
              </div>
            ) : (
              <div className="store-dashboard__empty">
                <h3 className="store-dashboard__empty-title">
                  Voce ainda nao publicou nenhuma carta
                </h3>
                <p className="store-dashboard__empty-text">
                  Crie seu primeiro anuncio para comecar a montar a vitrine da sua loja.
                </p>
                <Link
                  to="/new-listing"
                  className="store-dashboard__button store-dashboard__button--primary"
                >
                  Criar primeiro anuncio
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default StoreDashboard
