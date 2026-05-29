import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useStore } from '../hooks/useStore'
import { brazilStates } from '../../utils/brazilianStates.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function CreateStore() {
  const navigate = useNavigate()

  const {
    store,
    loading: storeLoading,
    fetchStore
  } = useStore()

  const [storeName, setStoreName] = useState('')
  const [storeSlug, setStoreSlug] = useState('')
  const [storeLogoUrl, setStoreLogoUrl] = useState('')
  const [storeDescription, setStoreDescription] = useState('')
  const [storeCity, setStoreCity] = useState('')
  const [storeState, setStoreState] = useState('')

  const [slugTouched, setSlugTouched] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (storeLoading) {
    return <div>Carregando...</div>
  }

  if (store) {
    return <Navigate to="/dashboard" replace />
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault()

    const name = storeName.trim()
    const slug = storeSlug.trim()

    if (!name || !slug) {
      setError('Nome e slug são obrigatórios')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const token = await window.Clerk?.session?.getToken()

      const response = await fetch(`${API_URL}/stores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
            ? `Bearer ${token}`
            : ''
        },
        body: JSON.stringify({
          name,
          slug,
          logoUrl: storeLogoUrl.trim(),
          description: storeDescription.trim(),
          location: {
            city: storeCity.trim(),
            state: storeState.trim()
          }
        })
      })

      if (!response.ok) {
        const data = await response.json()

        throw new Error(
          data.error || 'Erro ao criar loja'
        )
      }

      const createdStore = await response.json()

      console.log(createdStore)

      // atualiza o contexto antes do navigate
      await fetchStore()

      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="create-store">
      <div className="create-store__header">
        <h1 className="create-store__title">
          Criar loja
        </h1>

        <p className="create-store__subtitle">
          Preencha as informações iniciais da sua loja.
        </p>
      </div>

      {error && (
        <div
          className="create-store__error"
          style={{
            color: 'red',
            marginBottom: '1rem'
          }}
        >
          {error}
        </div>
      )}

      <form
        className="create-store__form"
        onSubmit={handleSubmit}
      >
        <div className="create-store__section">
          <h2 className="create-store__section-title">
            Informações da loja
          </h2>

          <label className="create-store__field">
            <span className="create-store__label">
              Nome da loja
            </span>

            <input
              className="create-store__input"
              type="text"
              value={storeName}
              onChange={handleStoreNameChange}
              placeholder="Ex: Loja do Bruno TCG"
              required
            />
          </label>

          <label className="create-store__field">
            <span className="create-store__label">
              Slug
            </span>

            <input
              className="create-store__input"
              type="text"
              value={storeSlug}
              onChange={handleStoreSlugChange}
              placeholder="loja-do-bruno-tcg"
              required
            />

            <span className="create-store__hint">
              URL da loja:
              {' '}
              /store/{storeSlug || 'minha-loja'}
            </span>
          </label>

          <label className="create-store__field">
            <span className="create-store__label">
              Logo da loja
            </span>

            <input
              className="create-store__input"
              type="url"
              value={storeLogoUrl}
              onChange={(e) =>
                setStoreLogoUrl(e.target.value)
              }
              placeholder="https://..."
            />
          </label>

          <label className="create-store__field">
            <span className="create-store__label">
              Descrição
            </span>

            <textarea
              className="create-store__textarea"
              value={storeDescription}
              onChange={(e) =>
                setStoreDescription(e.target.value)
              }
              placeholder="Descreva sua loja"
              rows="5"
            />
          </label>
        </div>

        <div className="create-store__section">
          <h2 className="create-store__section-title">
            Localização
          </h2>

          <div className="create-store__grid">
            <label className="create-store__field">
              <span className="create-store__label">
                Cidade
              </span>

              <input
                className="create-store__input"
                type="text"
                value={storeCity}
                onChange={(e) =>
                  setStoreCity(e.target.value)
                }
                placeholder="Ex: Rio de Janeiro"
              />
            </label>

            <label className="create-store__field">
              <span className="create-store__label">
                Estado
              </span>

              <select
                className="create-store__input"
                value={storeState}
                onChange={(e) =>
                  setStoreState(e.target.value)
                }
              >
                <option value="">
                  Selecione
                </option>

                {brazilStates.map((state) => (
                  <option
                    key={state.value}
                    value={state.value}
                  >
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
            disabled={submitting}
          >
            {submitting
              ? 'Criando...'
              : 'Criar loja'}
          </button>

          <button
            className="create-store__button create-store__button--secondary"
            type="button"
            onClick={() => navigate('/')}
            disabled={submitting}
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  )
}

export default CreateStore