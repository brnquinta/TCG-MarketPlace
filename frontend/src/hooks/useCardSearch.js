import { useEffect, useMemo, useRef, useState } from 'react'
import {
  searchCards,
  getUsdToBrl,
  getRarities,
  getSets,
} from '../services/pokemonTcg'

function useCardSearch() {
  const [filters, setFilters] = useState({
    name: '',
    number: '',
    set: '',
    rarity: '',
  })

  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [usdToBrl, setUsdToBrl] = useState(null)
  const [rarities, setRarities] = useState([])
  const [sets, setSets] = useState([])
  const [searched, setSearched] = useState(false)
  const [lastSearch, setLastSearch] = useState('')
  const [loadingOptions, setLoadingOptions] = useState(false)

  const [setQuery, setSetQuery] = useState('')
  const [showSetSuggestions, setShowSetSuggestions] = useState(false)

  const setAutocompleteRef = useRef(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingOptions(true)

      try {
        const [cotacao, raritiesData, setsData] = await Promise.all([
          getUsdToBrl().catch(() => 5.8),
          getRarities(),
          getSets(),
        ])

        setUsdToBrl(cotacao)
        setRarities(raritiesData.data || [])
        setSets(setsData.data || [])
      } catch (err) {
        console.error('Erro ao carregar filtros:', err)
        setUsdToBrl(5.8)
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchInitialData()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        setAutocompleteRef.current &&
        !setAutocompleteRef.current.contains(event.target)
      ) {
        setShowSetSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const normalizedFilters = useMemo(() => {
    return {
      name: filters.name.trim(),
      number: filters.number.trim(),
      set: filters.set.trim(),
      rarity: filters.rarity.trim(),
    }
  }, [filters])

  const hasFilter = useMemo(() => {
    return Object.values(normalizedFilters).some(
      (value) => (typeof value === 'string' ? value !== '' : Boolean(value))
    )
  }, [normalizedFilters])

  const filteredSets = useMemo(() => {
    const normalizedQuery = setQuery.trim().toLowerCase()

    if (!normalizedQuery) return []

    return sets
      .filter((setItem) =>
        setItem.name.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 8)
  }, [sets, setQuery])

  const formatBrl = (usd) => {
    if (!usdToBrl || !usd) return null

    return (usd * usdToBrl).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSetInputChange = (e) => {
    const value = e.target.value

    setSetQuery(value)
    setShowSetSuggestions(true)

    setFilters((prev) => ({
      ...prev,
      set: value,
    }))
  }

  const handleSelectSet = (setName) => {
    setSetQuery(setName)
    setShowSetSuggestions(false)

    setFilters((prev) => ({
      ...prev,
      set: setName,
    }))
  }

  const handleSetInputFocus = () => {
    if (setQuery.trim() !== '') {
      setShowSetSuggestions(true)
    }
  }

  const handleSetInputKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSetSuggestions(false)
    }
  }

  const handleSearch = async (e, options = {}) => {
    if (e?.preventDefault) {
      e.preventDefault()
    }

    if (!hasFilter) return

    const currentSearch = JSON.stringify(normalizedFilters)

    if (currentSearch === lastSearch) return

    setLoading(true)
    setError('')
    setSearched(true)

    try {
      const response = await searchCards({
        ...normalizedFilters,
        page: options.page || 1,
        pageSize: options.pageSize || 20,
      })

      setCards(response.data || [])
      setLastSearch(currentSearch)
    } catch (err) {
      console.error('Erro ao buscar cartas:', err)
      setError('Erro ao buscar cartas. Tente novamente.')
      setCards([])
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setFilters({
      name: '',
      number: '',
      set: '',
      rarity: '',
    })

    setSetQuery('')
    setShowSetSuggestions(false)
    setCards([])
    setSearched(false)
    setError('')
    setLastSearch('')
  }

  return {
    filters,
    setFilters,
    cards,
    setCards,
    loading,
    error,
    usdToBrl,
    rarities,
    sets,
    searched,
    lastSearch,
    loadingOptions,
    setQuery,
    showSetSuggestions,
    filteredSets,
    normalizedFilters,
    hasFilter,
    setAutocompleteRef,
    formatBrl,
    handleChange,
    handleSetInputChange,
    handleSelectSet,
    handleSetInputFocus,
    handleSetInputKeyDown,
    handleSearch,
    handleClear,
  }
}

export default useCardSearch