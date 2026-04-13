import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.pokemontcg.io/v2',
  headers: {
    'X-Api-Key': import.meta.env.VITE_POKEMON_TCG_API_KEY,
  },
})

export const getUsdToBrl = async () => {
  const response = await axios.get('https://economia.awesomeapi.com.br/json/last/USD-BRL')
  return parseFloat(response.data.USDBRL.bid)
}

export const searchCards = async ({ name, number, set, rarity, page = 1, pageSize = 20 }) => {
  const filters = []

  if (name) filters.push(`name:${name}*`)
  if (number) filters.push(`number:${number}`)
  if (set) filters.push(`set.name:"${set}"`)
  if (rarity) filters.push(`rarity:"${rarity}"`)

  const query = filters.join(' ')

  const response = await api.get('/cards', {
    params: {
      q: query,
      page,
      pageSize,
      orderBy: 'name',
    },
  })
  return response.data
}

export const getCardById = async (id) => {
  const response = await api.get(`/cards/${id}`)
  return response.data
}

export const getSets = async () => {
  const response = await api.get('/sets', {
    params: { orderBy: '-releaseDate' },
  })
  return response.data
}

export const getRarities = async () => {
  const response = await api.get('/rarities')
  return response.data
}

