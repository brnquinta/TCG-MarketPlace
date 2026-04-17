import { useState } from 'react'
import useCardSearch from '../hooks/useCardSearch'
import { CARD_CONDITIONS } from '../../utils/cardConditions'
import { CARD_LANGUAGE_FORM_OPTIONS } from '../../utils/cardLanguages'

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
    photos: null,
  })

  const [selectedCard, setSelectedCard] = useState(null)

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

  const handleListingChange = (e) => {
    const { name, value, type, checked, files } = e.target

    setListingData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'file'
            ? files
            : value,
    }))
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
        photos: listingData.photos,
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

                    {/* Ajustado para usar listingData e o utils de condições */}
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
                    <label className="newListing__label" htmlFor="photos">
                      Fotos reais do item
                    </label>
                    <input
                      id="photos"
                      className="newListing__input"
                      type="file"
                      name="photos"
                      multiple
                      accept="image/*"
                      onChange={handleListingChange}
                    />
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