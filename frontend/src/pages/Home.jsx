import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'

function Home() {
  return (
    <div className="home">
      <section className="home__hero">
        <h1 className="home__title">O marketplace de cartas Pokémon TCG do Brasil</h1>
        <p className="home__subtitle">
          Compre e venda cartas com segurança. Certificação PSA, CGC e BGS integrada.
        </p>

        <div className="home__actions">
          <Link to="/search" className="home__btn home__btn--primary">
            Buscar cartas
          </Link>

          <SignedOut>
            <SignInButton mode="modal">
              <button type="button" className="home__btn home__btn--secondary">
                Criar minha loja
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link to="/store/create" className="home__btn home__btn--secondary">
              Criar minha loja
            </Link>
          </SignedIn>
        </div>
      </section>

      <section className="home__features">
        <div className="home__feature">
          <span className="home__feature-icon">🔒</span>
          <h3 className="home__feature-title">Compra Segura</h3>
          <p className="home__feature-text">
            Cartas com certificação PSA, CGC e BGS verificadas pela plataforma.
          </p>
        </div>

        <div className="home__feature">
          <span className="home__feature-icon">💳</span>
          <h3 className="home__feature-title">Pagamento protegido</h3>
          <p className="home__feature-text">
            Seu dinheiro fica retido até você confirmar o recebimento da carta.
          </p>
        </div>

        <div className="home__feature">
          <span className="home__feature-icon">🃏</span>
          <h3 className="home__feature-title">Catálogo completo</h3>
          <p className="home__feature-text">
            Mais de 15 mil cartas cadastradas com preço de referência atualizado.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Home