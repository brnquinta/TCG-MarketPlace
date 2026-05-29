import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../hooks/useStore'

const BANNER_MIN_WIDTH = 800
const BANNER_MIN_HEIGHT = 200
const LOGO_MIN_SIZE = 100

function StoreEdit() {
  const { store, updateStore, updateLocation } = useStore()

  const [isEditing, setIsEditing] = useState(false)
  const [bannerError, setBannerError] = useState('')
  const [logoError, setLogoError] = useState('')
  const bannerInputRef = useRef(null)
  const logoInputRef = useRef(null)
  const [formData, setFormData] = useState({
    name: store.name,
    slug: store.slug,
    logoUrl: store.logoUrl,
    bannerUrl: store.bannerUrl,
    description: store.description,
    city: store.location.city,
    state: store.location.state,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    updateStore({
      name: formData.name,
      slug: formData.slug,
      logoUrl: formData.logoUrl,
      bannerUrl: formData.bannerUrl,
      description: formData.description,
    })
    updateLocation({
      city: formData.city,
      state: formData.state,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: store.name,
      slug: store.slug,
      logoUrl: store.logoUrl,
      bannerUrl: store.bannerUrl,
      description: store.description,
      city: store.location.city,
      state: store.location.state,
    })
    setIsEditing(false)
  }

  const validateImage = (file, minWidth, minHeight, isBanner = false) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        if (img.width >= minWidth && img.height >= minHeight) {
          resolve({ valid: true })
        } else {
          const hint = isBanner
            ? 'Recomendamos uma imagem grande (pelo menos 800x200px) para cobrir toda a largura.'
            : 'Recomendamos uma imagem quadrada (pelo menos 100x100px).'
          resolve({
            valid: false,
            message: `Tamanho atual: ${img.width}x${img.height}px. ${hint}`,
          })
        }
      }
      img.onerror = () => {
        resolve({ valid: false, message: 'Erro ao carregar a imagem. Tente outro arquivo.' })
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const handleBannerClick = () => {
    bannerInputRef.current?.click()
  }

  const handleLogoClick = () => {
    logoInputRef.current?.click()
  }

  const handleBannerChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const result = await validateImage(file, BANNER_MIN_WIDTH, BANNER_MIN_HEIGHT, true)
    if (!result.valid) {
      setBannerError(result.message)
      return
    }
    setBannerError('')
    const url = URL.createObjectURL(file)
    setFormData((prev) => ({ ...prev, bannerUrl: url }))
  }

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const result = await validateImage(file, LOGO_MIN_SIZE, LOGO_MIN_SIZE, false)
    if (!result.valid) {
      setLogoError(result.message)
      return
    }
    setLogoError('')
    const url = URL.createObjectURL(file)
    setFormData((prev) => ({ ...prev, logoUrl: url }))
  }

  const listings = store.stats?.activeListings || 0

  return (
    <section className="storeEdit">
      <div className="storeEdit__banner">
        {formData.bannerUrl ? (
          <img
            className="storeEdit__banner-image"
            src={formData.bannerUrl}
            alt={`Banner da loja ${formData.name}`}
          />
        ) : (
          <div className="storeEdit__banner-placeholder" />
        )}
        <button
          className="storeEdit__banner-edit"
          type="button"
          onClick={handleBannerClick}
        >
          Editar banner
        </button>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          onChange={handleBannerChange}
          style={{ display: 'none' }}
        />
        {bannerError && (
          <p className="storeEdit__error">{bannerError}</p>
        )}
      </div>

      <div className="storeEdit__header">
        <div className="storeEdit__identity">
          <div className="storeEdit__logo-wrapper">
            {formData.logoUrl ? (
              <img
                className="storeEdit__logo"
                src={formData.logoUrl}
                alt={`Logo da loja ${formData.name}`}
              />
            ) : (
              <div className="storeEdit__logo-placeholder">
                {formData.name.charAt(0)}
              </div>
            )}
            <button
              className="storeEdit__logo-edit"
              type="button"
              onClick={handleLogoClick}
            >
              Editar
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              style={{ display: 'none' }}
            />
            {logoError && (
              <p className="storeEdit__error storeEdit__error--logo">{logoError}</p>
            )}
          </div>

          <div className="storeEdit__info">
            <h1 className="storeEdit__title">{formData.name}</h1>
            <p className="storeEdit__slug">@{formData.slug}</p>
            <p className="storeEdit__location">
              {formData.city} - {formData.state}
            </p>
          </div>
        </div>

        <div className="storeEdit__stats">
          <div className="storeEdit__stat">
            <span className="storeEdit__stat-value">{listings}</span>
            <span className="storeEdit__stat-label">Anúncios</span>
          </div>

          <div className="storeEdit__stat">
            <span className="storeEdit__stat-value">0</span>
            <span className="storeEdit__stat-label">Vendas</span>
          </div>

          <div className="storeEdit__stat">
            <span className="storeEdit__stat-value storeEdit__stat-value--rating">
              <span className="storeEdit__rating-star">★</span>
              0
            </span>
            <span className="storeEdit__stat-label">0 avaliações</span>
          </div>
        </div>
      </div>

      <div className="storeEdit__content">
        <aside className="storeEdit__sidebar">
          {isEditing ? (
            <div className="storeEdit__card">
              <h2 className="storeEdit__section-title">Editar loja</h2>

              <div className="storeEdit__form">
                <div className="storeEdit__field">
                  <label className="storeEdit__label">Nome</label>
                  <input
                    className="storeEdit__input"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="storeEdit__field">
                  <label className="storeEdit__label">Slug</label>
                  <input
                    className="storeEdit__input"
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                  />
                </div>

                <div className="storeEdit__field">
                  <label className="storeEdit__label">Logo URL</label>
                  <input
                    className="storeEdit__input"
                    type="url"
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>

                <div className="storeEdit__field">
                  <label className="storeEdit__label">Banner URL</label>
                  <input
                    className="storeEdit__input"
                    type="url"
                    name="bannerUrl"
                    value={formData.bannerUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>

                <div className="storeEdit__field">
                  <label className="storeEdit__label">Descrição</label>
                  <textarea
                    className="storeEdit__textarea"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                  />
                </div>

                <div className="storeEdit__field">
                  <label className="storeEdit__label">Cidade</label>
                  <input
                    className="storeEdit__input"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="storeEdit__field">
                  <label className="storeEdit__label">Estado</label>
                  <input
                    className="storeEdit__input"
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>

                <div className="storeEdit__form-actions">
                  <button
                    className="storeEdit__btn storeEdit__btn--primary"
                    type="button"
                    onClick={handleSave}
                  >
                    Salvar
                  </button>
                  <button
                    className="storeEdit__btn storeEdit__btn--secondary"
                    type="button"
                    onClick={handleCancel}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="storeEdit__card">
                <div className="storeEdit__card-header">
                  <h2 className="storeEdit__section-title">Sobre a loja</h2>
                  <button
                    className="storeEdit__edit-btn"
                    type="button"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </button>
                </div>
                <p className="storeEdit__description">{formData.description}</p>
              </div>

              <div className="storeEdit__card">
                <h2 className="storeEdit__section-title">Informações</h2>
                <ul className="storeEdit__details">
                  <li className="storeEdit__detail-item">
                    <span className="storeEdit__detail-label">Cidade</span>
                    <span className="storeEdit__detail-value">{formData.city}</span>
                  </li>
                  <li className="storeEdit__detail-item">
                    <span className="storeEdit__detail-label">Estado</span>
                    <span className="storeEdit__detail-value">{formData.state}</span>
                  </li>
                </ul>
              </div>
            </>
          )}
        </aside>

        <div className="storeEdit__main">
          <div className="storeEdit__main-header">
            <h2 className="storeEdit__section-title">Anúncios da loja</h2>
          </div>

          <div className="storeEdit__empty">
            <h3 className="storeEdit__empty-title">Nenhum anúncio disponível</h3>
            <p className="storeEdit__empty-text">
              Esta loja ainda não possui cartas anunciadas.
            </p>
            <Link to="/new-listing" className="storeEdit__create-btn">
              Criar primeiro anúncio
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StoreEdit