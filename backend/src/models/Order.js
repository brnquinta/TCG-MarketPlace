import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true
    },
    cardName: String,
    cardImage: String,
    price: Number,
    quantity: Number
  }],
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  shipping: {
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'BR' }
    },
    method: String,
    trackingCode: String,
    shippedAt: Date,
    deliveredAt: Date
  },
  payment: {
    method: String,
    provider: String,
    providerOrderId: String,
    paidAt: Date,
    transactionId: String
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

orderSchema.statics.generateOrderNumber = async function() {
  const date = new Date()
  const prefix = `ORD${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`
  const lastOrder = await this.findOne({ orderNumber: new RegExp(`^${prefix}`) }).sort({ orderNumber: -1 })
  
  if (lastOrder) {
    const lastNumber = parseInt(lastOrder.orderNumber.slice(-6))
    return `${prefix}${String(lastNumber + 1).padStart(6, '0')}`
  }
  
  return `${prefix}000001`
}

const Order = mongoose.model('Order', orderSchema)

export default Order