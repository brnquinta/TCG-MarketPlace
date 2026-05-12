import express from 'express'
import User from '../models/User.js'
import Store from '../models/Store.js'
import Listing from '../models/Listing.js'

const router = express.Router()

// POST /api/debug/create-user - Criar usuario de teste
router.post('/create-user', async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName } = req.body
    
    let user = await User.findOne({ clerkId })
    
    if (user) {
      return res.json({ message: 'Usuario ja existe', user })
    }
    
    user = new User({ clerkId, email, firstName, lastName })
    await user.save()
    
    res.json({ message: 'Usuario criado', user })
  } catch (error) {
    console.error('Erro:', error.message)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// POST /api/debug/create-store - Criar loja de teste
router.post('/create-store', async (req, res) => {
  try {
    const { userClerkId, name, slug } = req.body
    
    const user = await User.findOne({ clerkId: userClerkId })
    if (!user) {
      return res.status(404).json({ error: 'Usuario nao encontrado' })
    }
    
    let store = await Store.findOne({ slug })
    if (store) {
      return res.json({ message: 'Loja ja existe', store })
    }
    
    store = new Store({
      userId: user._id,
      name,
      slug,
      status: 'active'
    })
    await store.save()
    
    res.json({ message: 'Loja criada', store })
  } catch (error) {
    console.error('Erro:', error.message)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// POST /api/debug/create-listing - Criar anuncio de teste
router.post('/create-listing', async (req, res) => {
  try {
    const { storeSlug, cardName, price, condition, language } = req.body
    
    const store = await Store.findOne({ slug: storeSlug })
    if (!store) {
      return res.status(404).json({ error: 'Loja nao encontrada' })
    }
    
    const listing = new Listing({
      storeId: store._id,
      userId: store.userId,
      cardSnapshot: {
        name: cardName,
        number: '1',
        rarity: 'Rare Holo',
        imageLarge: 'https://images.pokemontcg.io/base1/4_hires.png',
        setName: 'Base Set'
      },
      listingData: {
        price,
        condition,
        language,
        quantity: 1,
        status: 'active'
      },
      status: 'active'
    })
    await listing.save()
    
    res.json({ message: 'Anuncio criado', listing })
  } catch (error) {
    console.error('Erro:', error.message)
    res.status(500).json({ error: 'Erro interno' })
  }
})

export default router