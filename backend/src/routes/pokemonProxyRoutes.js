import cardsData from '../data/cards.json' with { type: 'json' }
import setsData from '../data/sets.json' with { type: 'json' }
import raritiesData from '../data/rarities.json' with { type: 'json' }

import { Router } from 'express'

const router = Router()


router.get('/cards', async (req, res) => {
  console.log('ROTA LOCAL /cards')

  const {
    q = '',
    page = 1,
    pageSize = 20,
  } = req.query

  let filteredCards = [...cardsData.data]

  console.log('QUERY:', q)

  // FILTRO NAME
  const nameMatch = q.match(/name:(.+?)\*/)

  if (nameMatch) {
    const name = nameMatch[1]
      .replace(/"/g, '')
      .trim()
      .toLowerCase()

    filteredCards = filteredCards.filter((card) =>
      card.name?.toLowerCase().includes(name)
    )
  }

  // FILTRO NUMBER
  const numberMatch = q.match(/number:(\S+)/)

  if (numberMatch) {
    const number = numberMatch[1]
      .replace(/"/g, '')
      .trim()

    filteredCards = filteredCards.filter(
      (card) => card.number === number
    )
  }

  // FILTRO SET
  const setMatch = q.match(/set\.name:"(.+?)"/)

  if (setMatch) {
    const setName = setMatch[1]
      .trim()
      .toLowerCase()

    filteredCards = filteredCards.filter(
      (card) =>
        card.set?.name?.toLowerCase() === setName
    )
  }

  // FILTRO RARITY
  const rarityMatch = q.match(/rarity:"(.+?)"/)

  if (rarityMatch) {
    const rarity = rarityMatch[1]
      .trim()
      .toLowerCase()

    filteredCards = filteredCards.filter(
      (card) =>
        card.rarity?.toLowerCase() === rarity
    )
  }

  // PAGINAÇÃO
  const currentPage = Number(page)
  const currentPageSize = Number(pageSize)

  const start = (currentPage - 1) * currentPageSize
  const end = start + currentPageSize

  const paginatedCards = filteredCards.slice(start, end)

  return res.json({
    data: paginatedCards,
    page: currentPage,
    pageSize: currentPageSize,
    count: filteredCards.length,
    totalCount: filteredCards.length,
  })
})

router.get('/cards/:id', async (req, res) => {

  console.log('ROTA LOCAL /cards/:id')

  const card = cardsData.data.find(
    (item) => item.id === req.params.id
  )

  if (!card) {
    return res.status(404).json({
      error: 'Carta não encontrada',
    })
  }

  return res.json({
    data: card,
  })
})

router.get('/sets', async (req, res) => {

  console.log('ROTA LOCAL /sets')

  return res.json(setsData)
})

router.get('/rarities', async (req, res) => {

  console.log('ROTA LOCAL /rarities')

  return res.json(raritiesData)
})

export default router