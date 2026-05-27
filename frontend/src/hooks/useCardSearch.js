import { useEffect, useMemo, useRef, useState } from 'react'
import {
  searchCards,
  getUsdToBrl,
  getRarities,
  getSets,
} from '../services/pokemonTcg'

// CACHE GLOBAL
let cachedSets = null
let cachedRarities = null
let cachedUsd = null

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
  const [loadingOptions, setLoadingOptions] = useState(false)

  const [setQuery, setSetQuery] = useState('')
  const [showSetSuggestions, setShowSetSuggestions] = useState(false)

  const setAutocompleteRef = useRef(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      if (cachedUsd && cachedRarities && cachedSets) {
        console.log('USANDO CACHE')

        setUsdToBrl(cachedUsd)
        setRarities(cachedRarities)
        setSets(cachedSets)

        return
      }

      setLoadingOptions(true)

      try {
        console.log('BUSCANDO DADOS LOCAIS')

        const [cotacao, raritiesData, setsData] = await Promise.all([
          getUsdToBrl().catch(() => 5.8),
          getRarities(),
          getSets(),
        ])

        cachedUsd = cotacao
        cachedRarities = raritiesData.data || []
        cachedSets = setsData.data || []

        setUsdToBrl(cachedUsd)
        setRarities(cachedRarities)
        setSets(cachedSets)
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
      (value) => value !== ''
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

    if (!hasFilter) {
      setCards([])
      return
    }

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