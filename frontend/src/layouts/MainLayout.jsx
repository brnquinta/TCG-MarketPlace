import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

function MainLayout({ children }) {
  return (
    <div className="main-layout">
      <header className="main-layout__header">
        <nav className="main-layout__nav">
          <Link to="/" className="main-layout__logo">
            TCG Marketplace
          </Link>
          <div className="main-layout__nav-links">
            <Link to="/search" className="main-layout__nav-link">Buscar cartas</Link>
            <Link to="/anuncios" className="main-layout__nav-link">Anuncios</Link>
            <SignedIn>
              <Link to="/dashboard" className="main-layout__nav-link">Minha loja</Link>
              <Link to="/new-listing" className="main-layout__nav-link">Anunciar carta</Link>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="main-layout__btn-login">Entrar</button>
              </SignInButton>
            </SignedOut>
          </div>
        </nav>
      </header>
      <main className="main-layout__content">
        {children}
      </main>
    </div>
  )
}

export default MainLayout