import { useState } from 'react'
import { Link } from 'react-router-dom'
import useCardSearch from '../hooks/useCardSearch'
import { CARD_CONDITION_FILTER_OPTIONS } from '../../utils/cardConditions'

function Search() {
  const [showListingFilters, setShowListingFilters] = useState(false)
  const [listingFilters, setListingFilters] = useState({
    condition: '',
    priceMin: '',
    priceMax: '',
    certified: '',
    language: '',
  })

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
    formatBrl,
    handleChange,
    handleSetInputChange,
    handleSelectSet,
    handleSetInputFocus,
    handleSetInputKeyDown,
    handleSearch,
    handleClear,
  } = useCardSearch()

  const handleListingFilterChange = (e) => {
    const { name, value } = e.target

    setListingFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleClearAll = () => {
    handleClear()

    setListingFilters({
      condition: '',
      priceMin: '',
      priceMax: '',
      certified: '',
      language: '',
    })

    setShowListingFilters(false)
  }

  return (
    <div className="search">
      <div className="search__layout">
        <div className="search__main">
          <form className="search__form" onSubmit={handleSearch}>
            <div className="search__filters">
              <div className="search__filter-group">
                <label className="search__label">Nome da carta</label>
                <input
                  className="search__input"
                  type="text"
                  name="name"
                  placeholder="Ex: Charizard, Pikachu..."
                  value={filters.name}
                  onChange={handleChange}
                />
              </div>

              <div className="search__filter-group">
                <label className="search__label">Número</label>
                <input
                  className="search__input"
                  type="text"
                  name="number"
                  placeholder="Ex: 025, 4"
                  value={filters.number}
                  onChange={handleChange}
                />
              </div>

              <div
                className="search__filter-group search__filter-group--autocomplete"
                ref={setAutocompleteRef}
              >
                <label className="search__label">Set</label>
                <input
                  className="search__input"
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
                  <div className="search__autocomplete">
                    {filteredSets.map((setItem) => (
                      <button
                        key={setItem.id}
                        className="search__autocomplete-item"
                        type="button"
                        onClick={() => handleSelectSet(setItem.name)}
                      >
                        {setItem.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="search__filter-group">
                <label className="search__label">Raridade</label>
                <select
                  className="search__input"
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

            <div className="search__form-actions">
              <button
                className="search__btn search__btn--ghost"
                type="button"
                onClick={() => setShowListingFilters((prev) => !prev)}
              >
                {showListingFilters ? 'Fechar filtros' : 'Filtros'}
              </button>

              <button
                className="search__btn search__btn--primary"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>

              <button
                className="search__btn search__btn--ghost"
                type="button"
                onClick={handleClearAll}
              >
                Limpar
              </button>
            </div>
          </form>

          {error && <p className="search__error">{error}</p>}

          {!searched && !loading && (
            <section className="search__results-box search__results-box--placeholder">
              <p className="search__placeholder-text">Pesquise uma carta</p>
            </section>
          )}

          {cards.length > 0 && (
            <section className="search__results-box">
              <div className="search__results">
                <p className="search__count">{cards.length} cartas encontradas</p>

                <div className="search__grid">
                  {cards.map((card) => (
                    <Link
                      to={`/card/${card.id}`}
                      key={card.id}
                      className="search__card"
                    >
                      <img
                        className="search__card-img"
                        src={card.images.small}
                        alt={card.name}
                      />

                      <div className="search__card-info">
                        <p className="search__card-name">{card.name}</p>
                        <p className="search__card-set">{card.set.name}</p>
                        <p className="search__card-number">
                          #{card.number}/{card.set.printedTotal}
                        </p>

                        {card.rarity && (
                          <p className="search__card-rarity">{card.rarity}</p>
                        )}

                        {card.cardmarket?.prices?.averageSellPrice && (
                          <p className="search__card-price">
                            Ref: {formatBrl(card.cardmarket.prices.averageSellPrice)}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {!loading && searched && cards.length === 0 && (
            <section className="search__results-box search__results-box--empty">
              <p className="search__empty">
                Nenhuma carta encontrada com esses filtros.
              </p>
            </section>
          )}
        </div>

        {showListingFilters && (
          <aside className="search__sidebar">
            <div className="search__listing-filters">
              <h3 className="search__listing-title">Filtros do anúncio</h3>

              <div className="search__sidebar-fields">
                <div className="search__filter-group">
                  <label className="search__label">Condição</label>
                  <select
                     className="search__input"
                     name="condition"
                     value={listingFilters.condition}
                     onChange={handleListingFilterChange}
>                   
                     {CARD_CONDITION_FILTER_OPTIONS.map((condition) => (
                       <option key={condition.value || 'all'} value={condition.value}>
                         {condition.label}
                       </option>
                     ))}
                    </select>
                </div>

                <div className="search__filter-group">
                  <label className="search__label">Preço mínimo</label>
                  <input
                    className="search__input"
                    type="number"
                    name="priceMin"
                    placeholder="Ex: 50"
                    value={listingFilters.priceMin}
                    onChange={handleListingFilterChange}
                  />
                </div>

                <div className="search__filter-group">
                  <label className="search__label">Preço máximo</label>
                  <input
                    className="search__input"
                    type="number"
                    name="priceMax"
                    placeholder="Ex: 500"
                    value={listingFilters.priceMax}
                    onChange={handleListingFilterChange}
                  />
                </div>

                <div className="search__filter-group">
                  <label className="search__label">Certificada</label>
                  <select
                    className="search__input"
                    name="certified"
                    value={listingFilters.certified}
                    onChange={handleListingFilterChange}
                  >
                    <option value="">Todas</option>
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </select>
                </div>

                <div className="search__filter-group">
                  <label className="search__label">Idioma</label>
                  <select
                    className="search__input"
                    name="language"
                    value={listingFilters.language}
                    onChange={handleListingFilterChange}
                  >
                    <option value="">Todos</option>
                    <option value="portugues">Português</option>
                    <option value="ingles">Inglês</option>
                    <option value="japones">Japonês</option>
                    <option value="espanhol">Espanhol</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

export default Search