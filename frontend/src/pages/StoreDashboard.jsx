import { Link } from 'react-router-dom'

function StoreDashboard() {
  const store = {
    name: 'Loja do Bruno TCG',
    slug: 'loja-do-bruno-tcg',
    description: 'Loja focada em cartas Pokémon para coleção e competitivo.',
    location: {
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    status: 'draft',
    onboardingStatus: 'pending',
    stats: {
      activeListings: 0,
      totalSales: 0,
      totalViews: 0,
    },
  }

  const nextSteps = [
    {
      id: 1,
      title: 'Completar dados da loja',
      description: 'Revise nome, slug, logo, descrição e localização.',
      actionLabel: 'Editar loja',
      actionPath: '/store/edit',
    },
    {
      id: 2,
      title: 'Ativar conta para vender',
      description: 'Preencha CPF/CNPJ, telefone, endereço e dados de repasse.',
      actionLabel: 'Fazer onboarding',
      actionPath: '/store/onboarding',
    },
    {
      id: 3,
      title: 'Criar primeiro anúncio',
      description: 'Publique sua primeira carta para começar a vender.',
      actionLabel: 'Novo anúncio',
      actionPath: '/new-listing',
    },
  ]

  const recentListings = []

  const getStoreStatusLabel = (status) => {
    if (status === 'active') return 'Ativa'
    if (status === 'draft') return 'Em configuração'
    return 'Indefinido'
  }

  const getOnboardingStatusLabel = (status) => {
    if (status === 'approved') return 'Aprovado'
    if (status === 'pending') return 'Pendente'
    return 'Não iniciado'
  }

  return (
    <section className="store-dashboard">
      <div className="store-dashboard__header">
        <div className="store-dashboard__header-content">
          <p className="store-dashboard__eyebrow">Painel da loja</p>
          <h1 className="store-dashboard__title">{store.name}</h1>
          <p className="store-dashboard__subtitle">
            Gerencie sua loja, acompanhe o status da conta e publique seus anúncios.
          </p>
        </div>

        <div className="store-dashboard__header-actions">
          <Link
            to={`/store/${store.slug}`}
            className="store-dashboard__button store-dashboard__button--secondary"
          >
            Ver loja pública
          </Link>

          <Link
            to="/new-listing"
            className="store-dashboard__button store-dashboard__button--primary"
          >
            Novo anúncio
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
                <span className="store-dashboard__detail-label">Localização</span>
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

            <Link
              to="/store/edit"
              className="store-dashboard__link-button"
            >
              Editar informações da loja
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
              <span className="store-dashboard__stat-label">Anúncios ativos</span>
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
              <span className="store-dashboard__stat-label">Visualizações</span>
            </article>
          </div>

          <div className="store-dashboard__card">
            <div className="store-dashboard__section-header">
              <h2 className="store-dashboard__card-title">Próximos passos</h2>
            </div>

            <div className="store-dashboard__steps">
              {nextSteps.map((step) => (
                <article key={step.id} className="store-dashboard__step">
                  <div className="store-dashboard__step-content">
                    <h3 className="store-dashboard__step-title">{step.title}</h3>
                    <p className="store-dashboard__step-description">
                      {step.description}
                    </p>
                  </div>

                  <Link
                    to={step.actionPath}
                    className="store-dashboard__step-button"
                  >
                    {step.actionLabel}
                  </Link>
                </article>
              ))}
            </div>
          </div>

          <div className="store-dashboard__card">
            <div className="store-dashboard__section-header">
              <h2 className="store-dashboard__card-title">Meus anúncios</h2>
              <Link
                to="/new-listing"
                className="store-dashboard__text-link"
              >
                Criar anúncio
              </Link>
            </div>

            {recentListings.length > 0 ? (
              <div className="store-dashboard__listings">
                {recentListings.map((listing) => (
                  <article
                    key={listing.id}
                    className="store-dashboard__listing"
                  >
                    {listing.name}
                  </article>
                ))}
              </div>
            ) : (
              <div className="store-dashboard__empty">
                <h3 className="store-dashboard__empty-title">
                  Você ainda não publicou nenhuma carta
                </h3>
                <p className="store-dashboard__empty-text">
                  Crie seu primeiro anúncio para começar a montar a vitrine da sua loja.
                </p>
                <Link
                  to="/new-listing"
                  className="store-dashboard__button store-dashboard__button--primary"
                >
                  Criar primeiro anúncio
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