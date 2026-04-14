import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { brazilStates } from '../../utils/brazilianStates.js'


function CreateStore() {
  const navigate = useNavigate()

  const [storeName, setStoreName] = useState('')
  const [storeSlug, setStoreSlug] = useState('')
  const [storeLogoUrl, setStoreLogoUrl] = useState('')
  const [storeDescription, setStoreDescription] = useState('')
  const [storeCity, setStoreCity] = useState('')
  const [storeState, setStoreState] = useState('')

  const [slugTouched, setSlugTouched] = useState(false)

  const slugify = (value) => {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  const handleStoreNameChange = (e) => {
    const value = e.target.value
    setStoreName(value)

    if (!slugTouched) {
      setStoreSlug(slugify(value))
    }
  }

  const handleStoreSlugChange = (e) => {
    setSlugTouched(true)
    setStoreSlug(slugify(e.target.value))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const name = storeName.trim()
    const slug = storeSlug.trim()
    const logoUrl = storeLogoUrl.trim()
    const description = storeDescription.trim()
    const city = storeCity.trim()
    const state = storeState.trim()

    console.log('name:', name)
    console.log('slug:', slug)
    console.log('logoUrl:', logoUrl)
    console.log('description:', description)
    console.log('city:', city)
    console.log('state:', state)

    navigate('/store/onboarding')
  }

  return (
    <section className="create-store">
      <div className="create-store__header">
        <h1 className="create-store__title">Criar loja</h1>
        <p className="create-store__subtitle">
          Preencha as informações iniciais da sua loja.
        </p>
      </div>

      <form className="create-store__form" onSubmit={handleSubmit}>
        <div className="create-store__section">
          <h2 className="create-store__section-title">Informações da loja</h2>

          <label className="create-store__field">
            <span className="create-store__label">Nome da loja</span>
            <input
              className="create-store__input"
              type="text"
              value={storeName}
              onChange={handleStoreNameChange}
              placeholder="Ex: Loja do Bruno TCG"
            />
          </label>

          <label className="create-store__field">
            <span className="create-store__label">Slug</span>
            <input
              className="create-store__input"
              type="text"
              value={storeSlug}
              onChange={handleStoreSlugChange}
              placeholder="loja-do-bruno-tcg"
            />
            <span className="create-store__hint">
              URL da loja: /store/{storeSlug || 'minha-loja'}
            </span>
          </label>

          <label className="create-store__field">
            <span className="create-store__label">Logo da loja</span>
            <input
              className="create-store__input"
              type="url"
              value={storeLogoUrl}
              onChange={(e) => setStoreLogoUrl(e.target.value)}
              placeholder="https://..."
            />
          </label>

          <label className="create-store__field">
            <span className="create-store__label">Descrição</span>
            <textarea
              className="create-store__textarea"
              value={storeDescription}
              onChange={(e) => setStoreDescription(e.target.value)}
              placeholder="Descreva sua loja"
              rows="5"
            />
          </label>
        </div>

        <div className="create-store__section">
          <h2 className="create-store__section-title">Localização</h2>

          <div className="create-store__grid">
            <label className="create-store__field">
              <span className="create-store__label">Cidade</span>
              <input
                className="create-store__input"
                type="text"
                value={storeCity}
                onChange={(e) => setStoreCity(e.target.value)}
                placeholder="Ex: Rio de Janeiro"
              />
            </label>

            <label className="create-store__field">
              <span className="create-store__label">Estado</span>
              <select
                className="create-store__input"
                value={storeState}
                onChange={(e) => setStoreState(e.target.value)}
              >
                <option value="">Selecione</option>
                {brazilStates.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="create-store__actions">
          <button
            className="create-store__button create-store__button--primary"
            type="submit"
          >
            Criar loja
          </button>

          <button
            className="create-store__button create-store__button--secondary"
            type="button"
            onClick={() => navigate('/')}
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  )
}

export default CreateStore