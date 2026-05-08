import mongoose from 'mongoose'

const storeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  logoUrl: {
    type: String,
    default: ''
  },
  bannerUrl: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    city: { type: String, default: '' },
    state: { type: String, default: '' }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'suspended'],
    default: 'draft'
  },
  onboardingStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'approved', 'rejected'],
    default: 'pending'
  },
  rating: {
    average: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 }
  },
  stats: {
    activeListings: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 }
  },
  contact: {
    phone: String,
    email: String
  },
  paymentInfo: {
    cpf: String,
    cnpj: String,
    bankAccount: String,
    pixKey: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

storeSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

const Store = mongoose.model('Store', storeSchema)

export default Store