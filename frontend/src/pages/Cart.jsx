import { useCart } from "../context/CartContext"
import { useUser } from "@clerk/clerk-react"
import { Link } from "react-router-dom"

function Cart() {
  const { cartItems, removeFromCart, getCartTotal, getItemsByStore } = useCart()
  const { user } = useUser()

  const itemsByStore = getItemsByStore()
  const total = getCartTotal()

  if (cartItems.length === 0) {
    return (
      <div className="Cart">
        <div className="cart-header">
          <h1>Carrinho</h1>
        </div>
        <div className="cart-empty">
          <h2>Seu carrinho está vazio</h2>
          <p>Adicione itens ao seu carrinho para continuar</p>
          <Link to="/" className="cart-empty-link">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="Cart">
      <div className="cart-header">
        <h1>Carrinho</h1>
        <p>{cartItems.length} item(s) • {user?.fullName || user?.emailAddresses[0]?.emailAddress}</p>
      </div>

      <div className="cart-content">
        <div className="cart-items-section">
          {Object.values(itemsByStore).map((group) => (
            <div key={group.store.id} className="cart-store-group">
              <div className="cart-store-header">
                <div className="cart-store-info">
                  <span className="cart-store-badge">Loja</span>
                  <span className="cart-store-info-text">
                    <strong>{group.store.name}</strong> • ⭐ {group.store.rating || '0'}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                  {group.items.length} item(s)
                </span>
              </div>

              <div className="cart-items-list">
                {group.items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img
                      src={item.cardSnapshot.imageLarge}
                      alt={item.cardSnapshot.name}
                      className="cart-item-image"
                    />
                    <div className="cart-item-details">
                      <h3>{item.cardSnapshot.name}</h3>
                      <div className="cart-item-meta">
                        <p>#{item.cardSnapshot.number} • {item.cardSnapshot.rarity}</p>
                        <span className="cart-item-condition">{item.listingData.condition}</span>
                      </div>
                      <p className="cart-item-price">R$ {item.listingData.price.toFixed(2)}</p>
                    </div>
                    <div className="cart-item-actions">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="cart-item-remove"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2 className="cart-summary-title">Resumo do Pedido</h2>
          
          <div className="cart-summary-row">
            <span className="cart-summary-label">Subtotal ({cartItems.length} itens)</span>
            <span className="cart-summary-value">R$ {total.toFixed(2)}</span>
          </div>
          
          <div className="cart-summary-row">
            <span className="cart-summary-label">Frete</span>
            <span className="cart-summary-value" style={{ color: '#6b7280' }}>Calcular na finalização</span>
          </div>
          
          <div className="cart-summary-row cart-summary-total">
            <span className="cart-summary-label">Total</span>
            <span className="cart-summary-value">R$ {total.toFixed(2)}</span>
          </div>

          <div className="cart-summary-breakdown">
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: '600', color: '#111827' }}>Por loja:</p>
            {Object.values(itemsByStore).map((group) => (
              <div key={group.store.id} className="cart-summary-store-row">
                <span>{group.store.name} ({group.items.length} itens)</span>
                <span>R$ {group.items.reduce((sum, item) => sum + item.listingData.price, 0).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <Link to="/checkout" className="cart-checkout-button">
            Finalizar Compra
          </Link>

          <p className="cart-summary-note">
            Você está comprando de {Object.keys(itemsByStore).length} loja(s) diferentes. OFrete será calculado separadamente para cada vendedor.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Cart