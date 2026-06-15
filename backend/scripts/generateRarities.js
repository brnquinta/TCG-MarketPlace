import fs from 'fs/promises'

import cardsData from '../src/data/cards.json' with { type: 'json' }

async function main() {
  try {

    const rarities = [
      ...new Set(
        cardsData.data
          .map((card) => card.rarity)
          .filter(Boolean)
      ),
    ].sort()

    const payload = {
      data: rarities,
    }

    await fs.writeFile(
      './src/data/rarities.json',
      JSON.stringify(payload, null, 2)
    )

    console.log('rarities.json atualizado!')
    console.log(`Total: ${rarities.length} raridades`)
  } catch (error) {
    console.error(error)
  }
}

main()