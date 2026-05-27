import fs from 'fs/promises'

const API_KEY = process.env.POKEMON_TCG_API_KEY

const SET_IDS = [
  'sv4pt5', // Paldean Fates
  'sv3pt5', // 151
  'swsh12pt5', // Crown Zenith
  'swsh7', // Evolving Skies
  'base1', // Base Set
]

const BASE_URL = 'https://api.pokemontcg.io/v2'

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'X-Api-Key': API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Erro ${response.status}`)
  }

  return response.json()
}

async function main() {
  try {
    let allCards = []
    let allSets = []

    for (const setId of SET_IDS) {
      console.log(`Baixando set ${setId}...`)

      try {
        const setResponse = await fetchJson(
          `${BASE_URL}/sets/${setId}`
        )

        allSets.push(setResponse.data)

        const cardsResponse = await fetchJson(
          `${BASE_URL}/cards?q=set.id:${setId}&pageSize=250`
        )

        allCards.push(...cardsResponse.data)

        console.log(`OK -> ${setId}`)
      } catch (err) {
        console.log(`ERRO NO SET ${setId}`)
        console.log(err.message)
      }
    }

    await fs.mkdir('./data', { recursive: true })

    await fs.writeFile(
      './data/sets.json',
      JSON.stringify({ data: allSets }, null, 2)
    )

    await fs.writeFile(
      './data/cards.json',
      JSON.stringify({ data: allCards }, null, 2)
    )

    console.log('Finalizado!')
    console.log(`Total cartas: ${allCards.length}`)
  } catch (error) {
    console.error(error)
  }
}

main()