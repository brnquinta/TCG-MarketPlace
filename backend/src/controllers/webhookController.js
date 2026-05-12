import User from '../models/User.js'
import crypto from 'crypto'

export async function handleClerkWebhook(req, res) {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  
  const payload = JSON.stringify(req.body)
  
  // Em desenvolvimento, permite teste sem assinatura
  const isDev = process.env.NODE_ENV === 'development'
  const hasValidSecret = secret && !secret.includes('your_')
  
  if (isDev || !hasValidSecret) {
    console.log('Modo desenvolvimento: assinatura ignorada')
  } else {
    let signature = req.headers['clerk-signature']
    
    if (!signature) {
      console.warn('Webhook Clerk sem assinatura')
      return res.status(400).json({ error: 'Missing clerk-signature header' })
    }

    const timestamp = req.headers['clerk-timestamp']
    
    if (secret && timestamp) {
      const signedPayload = `${timestamp}.${payload}`
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex')
      
      if (signature !== expectedSignature) {
        console.warn('Webhook Clerk assinatura invalida')
        return res.status(400).json({ error: 'Invalid signature' })
      }
    }
  }

  const { type, data } = req.body

  console.log(`Webhook Clerk recebido: ${type}`)

  try {
    switch (type) {
      case 'user.created':
        await handleUserCreated(data)
        break
      case 'user.updated':
        await handleUserUpdated(data)
        break
      case 'user.deleted':
        await handleUserDeleted(data)
        break
      default:
        console.log(`Evento Clerk nao tratado: ${type}`)
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Erro ao processar webhook Clerk:', error.message)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleUserCreated(data) {
  const user = await User.findOne({ clerkId: data.id })
  
  if (user) {
    console.log(`Usuario ${data.id} ja existe`)
    return
  }

  const newUser = new User({
    clerkId: data.id,
    email: data.email_addresses?.[0]?.email_address || '',
    firstName: data.first_name || '',
    lastName: data.last_name || '',
    imageUrl: data.image_url || ''
  })

  await newUser.save()
  console.log(`Usuario criado: ${data.id} - ${newUser.email}`)
}

async function handleUserUpdated(data) {
  const user = await User.findOne({ clerkId: data.id })
  
  if (!user) {
    console.log(`Usuario ${data.id} nao encontrado para atualizar`)
    return
  }

  user.email = data.email_addresses?.[0]?.email_address || user.email
  user.firstName = data.first_name || user.firstName
  user.lastName = data.last_name || user.lastName
  user.imageUrl = data.image_url || user.imageUrl

  await user.save()
  console.log(`Usuario atualizado: ${data.id}`)
}

async function handleUserDeleted(data) {
  const user = await User.findOne({ clerkId: data.id })
  
  if (!user) {
    console.log(`Usuario ${data.id} nao encontrado para deletar`)
    return
  }

  await user.deleteOne()
  console.log(`Usuario deletado: ${data.id}`)
}

export async function syncUserFromClerk(clerkId) {
  const response = await fetch(
    `https://api.clerk.com/v1/users/${clerkId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
      }
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch user from Clerk')
  }

  const data = await response.json()
  await handleUserCreated(data)
}