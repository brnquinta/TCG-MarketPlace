import Cart from '../models/Cart.js'
import Listing from '../models/Listing.js'

export async function getCart(req, res) {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate({
      path: 'items.listingId',
      populate: {
        path: 'storeId',
        select: 'name rating'
      }
    })

    if (!cart) {
      return res.json({ items: [], total: 0 })
    }

    const total = cart.items.reduce((sum, item) => sum + item.price, 0)

    res.json({
      items: cart.items,
      total
    })
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error.message)
    res.status(500).json({ error: 'Erro interno' })
  }
}

export async function addItem(req, res) {
  try {
    const { listingId } = req.body

    if (!listingId) {
      return res.status(400).json({ error: 'listingId e obrigatorio' })
    }

    const listing = await Listing.findById(listingId)
    if (!listing) {
      return res.status(404).json({ error: 'Anuncio nao encontrado' })
    }

    if (listing.status !== 'active') {
      return res.status(400).json({ error: 'Anuncio nao esta ativo' })
    }

    if (listing.listingData.quantity < 1) {
      return res.status(400).json({ error: 'Anuncio sem estoque' })
    }

    let cart = await Cart.findOne({ userId: req.user.id })

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] })
    }

    const existingItem = cart.items.find(
      item => item.listingId.toString() === listingId
    )

    if (existingItem) {
      return res.status(400).json({ error: 'Item ja esta no carrinho' })
    }

    cart.items.push({
      listingId,
      price: listing.listingData.price
    })

    await cart.save()

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.listingId',
      populate: {
        path: 'storeId',
        select: 'name rating'
      }
    })

    const total = populatedCart.items.reduce((sum, item) => sum + item.price, 0)

    res.json({
      items: populatedCart.items,
      total
    })
  } catch (error) {
    console.error('Erro ao adicionar item:', error.message)
    res.status(500).json({ error: 'Erro interno' })
  }
}

export async function removeItem(req, res) {
  try {
    const { listingId } = req.params

    const cart = await Cart.findOne({ userId: req.user.id })

    if (!cart) {
      return res.status(404).json({ error: 'Carrinho nao encontrado' })
    }

    const itemIndex = cart.items.findIndex(
      item => item.listingId.toString() === listingId
    )

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item nao encontrado no carrinho' })
    }

    cart.items.splice(itemIndex, 1)
    await cart.save()

    const total = cart.items.reduce((sum, item) => sum + item.price, 0)

    res.json({
      items: cart.items,
      total
    })
  } catch (error) {
    console.error('Erro ao remover item:', error.message)
    res.status(500).json({ error: 'Erro interno' })
  }
}

export async function clearCart(req, res) {
  try {
    await Cart.findOneAndDelete({ userId: req.user.id })

    res.json({ message: 'Carrinho limpo', items: [], total: 0 })
  } catch (error) {
    console.error('Erro ao limpar carrinho:', error.message)
    res.status(500).json({ error: 'Erro interno' })
  }
}