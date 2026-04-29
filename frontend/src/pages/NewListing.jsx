import { useMemo, useState } from 'react'
import useCardSearch from '../hooks/useCardSearch'
import { CARD_CONDITIONS } from '../../utils/cardConditions'
import { CARD_LANGUAGE_FORM_OPTIONS } from '../../utils/cardLanguages'

const PHOTO_STEPS = [
  {
    key: 'front90',
    title: 'Frente — 90°',
    instruction: 'Mesa escura, luz sobre o produto e topo para cima.',
    alt: 'Preview frente 90 graus',
  },
  {
    key: 'back90',
    title: 'Verso — 90°',
    instruction: 'Mesa escura, luz sobre o produto e topo para cima.',
    alt: 'Preview verso 90 graus',
  },
  {
    key: 'front45',
    title: 'Frente — 45°',
    instruction: 'Mesa escura, luz sobre o produto e inclinação de 45°.',
    alt: 'Preview frente 45 graus',
  },
  {
    key: 'back45',
    title: 'Verso — 45°',
    instruction: 'Mesa escura, luz sobre o produto e inclinação de 45°.',
    alt: 'Preview verso 45 graus',
  },
]

function NewListing() {
  const [listingData, setListingData] = useState({
    language: '',
    condition: '',
    price: '',
    quantity: 1,
    certified: '',
    gradingCompany: '',
    grade: '',
    acceptsOffer: false,
    description: '',
    defects: '',
    shippingAvailable: true,
    localPickup: false,
    city: '',
    state: '',
    requiredPhotos: {
      front90: null,
      back90: null,
      front45: null,
      back45: null,
    },
  })

  const [selectedCard, setSelectedCard] = useState(null)
  const [photoPreviews, setPhotoPreviews] = useState({
    front90: '',
    back90: '',
    front45: '',
    back45: '',
  })
  const [activePhotoStep, setActivePhotoStep] = useState(0)

  const {
    filters,
    cards,
    loading,
    error,
    rarities,
    searched,
    setQuery,
    showSetSuggestions,
    filteredSets,
    setAutocompleteRef,
    handleChange,
    handleSetInputChange,
    handleSelectSet,
    handleSetInputFocus,
    handleSetInputKeyDown,
    handleSearch,
    handleClear,
  } = useCardSearch()

  const currentPhotoStep = PHOTO_STEPS[activePhotoStep]
  const currentPhotoFile = listingData.requiredPhotos[currentPhotoStep.key]
  const currentPhotoPreview = photoPreviews[currentPhotoStep.key]

  const completedPhotoSteps = useMemo(() => {
    return PHOTO_STEPS.filter((step) => listingData.requiredPhotos[step.key]).length
  }, [listingData.requiredPhotos])

  const allPhotosSent = completedPhotoSteps === PHOTO_STEPS.length

  const handleListingChange = (e) => {
    const { name, value, type, checked } = e.target

    setListingData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleRequiredPhotoChange = (e) => {
    const { name, files } = e.target
    const file = files?.[0] || null

    setListingData((prev) => ({
      ...prev,
      requiredPhotos: {
        ...prev.requiredPhotos,
        [name]: file,
      },
    }))

    setPhotoPreviews((prev) => ({
      ...prev,
      [name]: file ? URL.createObjectURL(file) : '',
    }))
  }

  const handleRemoveRequiredPhoto = (photoKey) => {
    setListingData((prev) => ({
      ...prev,
      requiredPhotos: {
        ...prev.requiredPhotos,
        [photoKey]: null,
      },
    }))

    setPhotoPreviews((prev) => ({
      ...prev,
      [photoKey]: '',
    }))
  }

  const handleNextPhotoStep = () => {
    setActivePhotoStep((prev) =>
      prev < PHOTO_STEPS.length - 1 ? prev + 1 : prev
    )
  }

  const handlePrevPhotoStep = () => {
    setActivePhotoStep((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const handleGoToPhotoStep = (stepIndex) => {
    setActivePhotoStep(stepIndex)
  }

  const getPhotoStatus = (file) => {
    return file ? 'Enviada' : 'Pendente'
  }

  const handleResetCardSearch = () => {
    handleClear()
    setSelectedCard(null)
  }

  const handleSelectCard = (card) => {
    setSelectedCard(card)
  }

  const handleRemoveSelectedCard = () => {
    setSelectedCard(null)
  }

  const handleCreate = (e) => {
    e.preventDefault()

    if (!selectedCard) {
      return
    }

    const { front90, back90, front45, back45 } = listingData.requiredPhotos

    if (!front90 || !back90 || !front45 || !back45) {
      console.log('Envie as 4 fotos obrigatórias do item.')
      return
    }

    const payload = {
      cardId: selectedCard.id,
      cardSnapshot: {
        name: selectedCard.name || '',
        number: selectedCard.number || '',
        rarity: selectedCard.rarity || '',
        supertype: selectedCard.supertype || '',
        subtypes: selectedCard.subtypes || [],
        imageSmall: selectedCard.images?.small || '',
        imageLarge: selectedCard.images?.large || '',
        setId: selectedCard.set?.id || '',
        setName: selectedCard.set?.name || '',
        setSeries: selectedCard.set?.series || '',
        setReleaseDate: selectedCard.set?.releaseDate || '',
      },
      listingData: {
        language: listingData.language,
        condition: listingData.condition,
        price: Number(listingData.price),
        quantity: Number(listingData.quantity),
        certified: listingData.certified === 'true',
        gradingCompany: listingData.gradingCompany.trim(),
        grade: listingData.grade.trim(),
        acceptsOffer: listingData.acceptsOffer,
        description: listingData.description.trim(),
        defects: listingData.defects.trim(),
        shippingAvailable: listingData.shippingAvailable,
        localPickup: listingData.localPickup,
        city: listingData.city.trim(),
        state: listingData.state.trim(),
        requiredPhotos: {
          front90,
          back90,
          front45,
          back45,
        },
      },
    }

    console.log('Payload do anúncio:', payload)
  }

  return (
    <div className="newListing">
      <div className="newListing__layout">
        <div className="newListing__main">
          <form className="newListing__form" onSubmit={handleCreate}>
            <div className="newListing__container">
              <section className="newListing__section">
                <h2 className="newListing__section-title">Selecionar carta</h2>

                <div className="newListing__search-box">
                  <div className="newListing__fields">
                    <div className="newListing__field-group">
                      <label className="newListing__label" htmlFor="card-name">
                        Nome da carta
                      </label>
                      <input
                        id="card-name"
                        className="newListing__input"
                        type="text"
                        name="name"
                        placeholder="Ex.: Charizard"
                        value={filters.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="newListing__field-group">
                      <label className="newListing__label" htmlFor="card-number">
                        Número
                      </label>
                      <input
                        id="card-number"
                        className="newListing__input"
                        type="text"
                        name="number"
                        placeholder="Ex.: 4"
                        value={filters.number}
                        onChange={handleChange}
                      />
                    </div>

                    <div
                      className="newListing__field-group newListing__field-group--autocomplete"
                      ref={setAutocompleteRef}
                    >
                      <label className="newListing__label" htmlFor="card-set">
                        Set
                      </label>
                      <input
                        id="card-set"
                        className="newListing__input"
                        type="text"
                        name="set"
                        placeholder="Digite o nome do set"
                        value={setQuery}
                        onChange={handleSetInputChange}
                        onFocus={handleSetInputFocus}
                        onKeyDown={handleSetInputKeyDown}
                        autoComplete="off"
                      />

                      {showSetSuggestions && filteredSets.length > 0 && (
                        <div className="newListing__autocomplete">
                          {filteredSets.map((setItem) => (
                            <button
                              key={setItem.id}
                              className="newListing__autocomplete-item"
                              type="button"
                              onClick={() => handleSelectSet(setItem.name)}
                            >
                              {setItem.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="newListing__field-group">
                      <label className="newListing__label" htmlFor="card-rarity">
                        Raridade
                      </label>
                      <select
                        id="card-rarity"
                        className="newListing__select"
                        name="rarity"
                        value={filters.rarity}
                        onChange={handleChange}
                      >
                        <option value="">Todas</option>
                        {rarities.map((rarity) => (
                          <option key={rarity} value={rarity}>
                            {rarity}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="newListing__actions">
                    <button
                      className="newListing__btn"
                      type="button"
                      onClick={(e) => handleSearch(e, { page: 1, pageSize: 20 })}
                      disabled={loading}
                    >
                      {loading ? 'Buscando...' : 'Buscar carta'}
                    </button>

                    <button
                      className="newListing__btn newListing__btn--ghost"
                      type="button"
                      onClick={handleResetCardSearch}
                    >
                      Limpar
                    </button>
                  </div>

                  {error && <p className="newListing__error">{error}</p>}

                  {searched && !loading && cards.length === 0 && !error && (
                    <div className="newListing__results-box newListing__results-box--empty">
                      <p className="newListing__empty">
                        Nenhuma carta encontrada para essa busca.
                      </p>
                    </div>
                  )}

                  {cards.length > 0 && (
                    <div className="newListing__results-box">
                      <p className="newListing__count">
                        {cards.length} carta(s) encontrada(s)
                      </p>

                      <div className="newListing__grid">
                        {cards.map((card) => (
                          <button
                            key={card.id}
                            className={`newListing__card ${
                              selectedCard?.id === card.id
                                ? 'newListing__card--selected'
                                : ''
                            }`}
                            type="button"
                            onClick={() => handleSelectCard(card)}
                          >
                            <img
                              className="newListing__card-img"
                              src={card.images?.small}
                              alt={card.name}
                            />

                            <div className="newListing__card-info">
                              <h3 className="newListing__card-name">{card.name}</h3>
                              <p className="newListing__card-set">
                                {card.set?.name || 'Set não informado'}
                              </p>
                              <p className="newListing__card-number">
                                Nº {card.number || '-'}
                              </p>
                              <p className="newListing__card-rarity">
                                {card.rarity || 'Raridade não informada'}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {selectedCard && (
                <section className="newListing__section">
                  <div className="newListing__section-header">
                    <h2 className="newListing__section-title">Carta selecionada</h2>

                    <button
                      className="newListing__btn newListing__btn--ghost"
                      type="button"
                      onClick={handleRemoveSelectedCard}
                    >
                      Remover carta
                    </button>
                  </div>

                  <div className="newListing__selected-card">
                    <img
                      className="newListing__selected-card-img"
                      src={selectedCard.images?.small}
                      alt={selectedCard.name}
                    />

                    <div className="newListing__selected-card-content">
                      <div className="newListing__fields">
                        <div className="newListing__field-group">
                          <label className="newListing__label">Nome</label>
                          <input
                            className="newListing__input"
                            type="text"
                            value={selectedCard.name || ''}
                            readOnly
                          />
                        </div>

                        <div className="newListing__field-group">
                          <label className="newListing__label">Número</label>
                          <input
                            className="newListing__input"
                            type="text"
                            value={selectedCard.number || ''}
                            readOnly
                          />
                        </div>

                        <div className="newListing__field-group">
                          <label className="newListing__label">Set</label>
                          <input
                            className="newListing__input"
                            type="text"
                            value={selectedCard.set?.name || ''}
                            readOnly
                          />
                        </div>

                        <div className="newListing__field-group">
                          <label className="newListing__label">Raridade</label>
                          <input
                            className="newListing__input"
                            type="text"
                            value={selectedCard.rarity || ''}
                            readOnly
                          />
                        </div>

                        <div className="newListing__field-group">
                          <label className="newListing__label">Tipo</label>
                          <input
                            className="newListing__input"
                            type="text"
                            value={selectedCard.supertype || ''}
                            readOnly
                          />
                        </div>

                        <div className="newListing__field-group">
                          <label className="newListing__label">Subtipos</label>
                          <input
                            className="newListing__input"
                            type="text"
                            value={selectedCard.subtypes?.join(', ') || ''}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              <section className="newListing__section">
                <h2 className="newListing__section-title">Dados do anúncio</h2>

                <div className="newListing__fields">
                  <div className="newListing__field-group">
                    <label className="newListing__label" htmlFor="language">
                      Idioma
                    </label>
                    <select
                      id="language"
                      className="newListing__select"
                      name="language"
                      value={listingData.language}
                      onChange={handleListingChange}
                    >
                      {CARD_LANGUAGE_FORM_OPTIONS.map((language) => (
                        <option
                          key={language.value || 'placeholder'}
                          value={language.value}
                        >
                          {language.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="newListing__field-group">
                    <label className="newListing__label" htmlFor="condition">
                      Condição
                    </label>
                    <select
                      id="condition"
                      className="newListing__select"
                      name="condition"
                      value={listingData.condition}
                      onChange={handleListingChange}
                    >
                      <option value="">Selecione</option>
                      {CARD_CONDITIONS.map((condition) => (
                        <option key={condition.value} value={condition.value}>
                          {condition.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="newListing__field-group">
                    <label className="newListing__label" htmlFor="price">
                      Preço
                    </label>
                    <input
                      id="price"
                      className="newListing__input"
                      type="number"
                      name="price"
                      min="0"
                      step="0.01"
                      placeholder="Ex.: 199.90"
                      value={listingData.price}
                      onChange={handleListingChange}
                    />
                  </div>

                  <div className="newListing__field-group">
                    <label className="newListing__label" htmlFor="quantity">
                      Quantidade
                    </label>
                    <input
                      id="quantity"
                      className="newListing__input"
                      type="number"
                      name="quantity"
                      min="1"
                      value={listingData.quantity}
                      onChange={handleListingChange}
                    />
                  </div>

                  <div className="newListing__field-group">
                    <label className="newListing__label" htmlFor="certified">
                      Certificada
                    </label>
                    <select
                      id="certified"
                      className="newListing__select"
                      name="certified"
                      value={listingData.certified}
                      onChange={handleListingChange}
                    >
                      <option value="">Selecione</option>
                      <option value="true">Sim</option>
                      <option value="false">Não</option>
                    </select>
                  </div>

                  <div className="newListing__field-group">
                    <label className="newListing__label" htmlFor="gradingCompany">
                      Empresa de certificação
                    </label>
                    <input
                      id="gradingCompany"
                      className="newListing__input"
                      type="text"
                      name="gradingCompany"
                      placeholder="Ex.: PSA"
                      value={listingData.gradingCompany}
                      onChange={handleListingChange}
                    />
                  </div>

                  <div className="newListing__field-group">
                    <label className="newListing__label" htmlFor="grade">
                      Nota
                    </label>
                    <input
                      id="grade"
                      className="newListing__input"
                      type="text"
                      name="grade"
                      placeholder="Ex.: 10"
                      value={listingData.grade}
                      onChange={handleListingChange}
                    />
                  </div>

                  <div className="newListing__field-group">
                    <label className="newListing__label" htmlFor="city">
                      Cidade
                    </label>
                    <input
                      id="city"
                      className="newListing__input"
                      type="text"
                      name="city"
                      placeholder="Cidade"
                      value={listingData.city}
                      onChange={handleListingChange}
                    />
                  </div>

                  <div className="newListing__field-group">
                    <label className="newListing__label" htmlFor="state">
                      Estado
                    </label>
                    <input
                      id="state"
                      className="newListing__input"
                      type="text"
                      name="state"
                      placeholder="Estado"
                      value={listingData.state}
                      onChange={handleListingChange}
                    />
                  </div>

                  <div className="newListing__field-group newListing__field-group--full">
                    <label className="newListing__label" htmlFor="description">
                      Descrição
                    </label>
                    <textarea
                      id="description"
                      className="newListing__textarea"
                      name="description"
                      placeholder="Descreva o anúncio"
                      value={listingData.description}
                      onChange={handleListingChange}
                    />
                  </div>

                  <div className="newListing__field-group newListing__field-group--full">
                    <label className="newListing__label" htmlFor="defects">
                      Defeitos ou observações
                    </label>
                    <textarea
                      id="defects"
                      className="newListing__textarea"
                      name="defects"
                      placeholder="Informe riscos, whitening, marcas, etc."
                      value={listingData.defects}
                      onChange={handleListingChange}
                    />
                  </div>

                  <div className="newListing__field-group newListing__field-group--full">
                    <label className="newListing__label">
                      Fotos obrigatórias do item
                    </label>

                    <p className="newListing__helper">
                      Envie uma foto por etapa. Isso reduz a altura da tela e guia
                      o seller no fluxo correto.
                    </p>

                    <div className="newListing__stepper">
                      <div className="newListing__stepper-progress">
                        <div className="newListing__stepper-track" />

                        {PHOTO_STEPS.map((step, index) => {
                          const isCompleted = Boolean(
                            listingData.requiredPhotos[step.key]
                          )
                          const isActive = activePhotoStep === index

                          return (
                            <button
                              key={step.key}
                              type="button"
                              className={`newListing__stepper-dot ${
                                isActive ? 'newListing__stepper-dot--active' : ''
                              } ${
                                isCompleted
                                  ? 'newListing__stepper-dot--completed'
                                  : ''
                              }`}
                              onClick={() => handleGoToPhotoStep(index)}
                            >
                              <span className="newListing__stepper-dot-number">
                                {index + 1}
                              </span>
                              <span className="newListing__stepper-dot-label">
                                {step.title}
                              </span>
                            </button>
                          )
                        })}
                      </div>

                      <div className="newListing__stepper-summary">
                        <span className="newListing__stepper-summary-text">
                          {completedPhotoSteps} de {PHOTO_STEPS.length} fotos enviadas
                        </span>
                      </div>

                      <div className="newListing__stepper-card">
                        <div className="newListing__photo-step-header">
                          <div className="newListing__stepper-card-title-wrap">
                            <p className="newListing__stepper-card-step">
                              Etapa {activePhotoStep + 1}
                            </p>
                            <h3 className="newListing__stepper-card-title">
                              {currentPhotoStep.title}
                            </h3>
                          </div>

                          <span
                            className={`newListing__photo-status ${
                              currentPhotoFile
                                ? 'newListing__photo-status--sent'
                                : 'newListing__photo-status--pending'
                            }`}
                          >
                            {getPhotoStatus(currentPhotoFile)}
                          </span>
                        </div>

                        <p className="newListing__photo-instruction">
                          {currentPhotoStep.instruction}
                        </p>

                        <input
                          id={currentPhotoStep.key}
                          className="newListing__input"
                          type="file"
                          name={currentPhotoStep.key}
                          accept="image/*"
                          onChange={handleRequiredPhotoChange}
                        />

                        {currentPhotoFile && (
                          <>
                            <div className="newListing__photo-preview-box">
                              <img
                                className="newListing__photo-preview"
                                src={currentPhotoPreview}
                                alt={currentPhotoStep.alt}
                              />
                            </div>

                            <button
                              type="button"
                              className="newListing__btn newListing__btn--ghost"
                              onClick={() =>
                                handleRemoveRequiredPhoto(currentPhotoStep.key)
                              }
                            >
                              Remover foto
                            </button>
                          </>
                        )}

               <div className="newListing__stepper-actions">
                  <button
                    type="button"
                    className="newListing__btn newListing__btn--ghost"
                    onClick={handlePrevPhotoStep}
                    disabled={activePhotoStep === 0}
                  >
                    Anterior
                  </button>
                                    
                  {allPhotosSent && activePhotoStep === PHOTO_STEPS.length - 1 ? (
                    <button
                      type="button"
                      className="newListing__btn newListing__stepper-complete-btn"
                    >
                      Concluir fotos
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="newListing__btn"
                      onClick={handleNextPhotoStep}
                      disabled={activePhotoStep === PHOTO_STEPS.length - 1}
                    >
                      Próxima
                    </button>
                  )}
                </div>
            </div>

                      {allPhotosSent && (
                        <p className="newListing__stepper-complete">
                          Todas as fotos obrigatórias foram enviadas.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="newListing__checkboxes">
                  <label className="newListing__checkbox">
                    <input
                      type="checkbox"
                      name="shippingAvailable"
                      checked={listingData.shippingAvailable}
                      onChange={handleListingChange}
                    />
                    Envio disponível
                  </label>

                  <label className="newListing__checkbox">
                    <input
                      type="checkbox"
                      name="localPickup"
                      checked={listingData.localPickup}
                      onChange={handleListingChange}
                    />
                    Retirada em mãos
                  </label>

                  <label className="newListing__checkbox">
                    <input
                      type="checkbox"
                      name="acceptsOffer"
                      checked={listingData.acceptsOffer}
                      onChange={handleListingChange}
                    />
                    Aceita oferta
                  </label>
                </div>
              </section>

              <div className="newListing__actions">
                <button className="newListing__btn" type="submit">
                  Criar anúncio
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NewListing