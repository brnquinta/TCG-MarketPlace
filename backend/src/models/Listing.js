import mongoose from 'mongoose'

const listingSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  cardSnapshot: {
    cardId: String,
    name: { type: String, required: true },
    number: String,
    rarity: String,
    supertype: String,
    subtypes: [String],
    imageSmall: String,
    imageLarge: String,
    setId: String,
    setName: String,
    setSeries: String,
    setReleaseDate: String
  },
  listingData: {
    language: {
      type: String,
      enum: ['PT-BR', 'EN', 'JP', 'ES', 'FR', 'DE', 'IT', 'KO', 'ZH'],
      required: true
    },
    condition: {
      type: String,
      enum: ['NM', 'LP', 'MP', 'HP', 'DM'],
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    certified: {
      type: Boolean,
      default: false
    },
    gradingCompany: {
      type: String,
      enum: ['PSA', 'BGS', 'CGC', 'OTHER'],
      default: null
    },
    grade: String,
    acceptsOffer: {
      type: Boolean,
      default: false
    },
    description: String,
    defects: String,
    shippingAvailable: {
      type: Boolean,
      default: true
    },
    localPickup: {
      type: Boolean,
      default: false
    },
    city: String,
    state: String
  },
  photos: {
    front90: String,
    back90: String,
    front45: String,
    back45: String
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'sold', 'inactive', 'removed'],
    default: 'draft'
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  soldAt: Date
})

listingSchema.index({ 'listingData.price': 1 })
listingSchema.index({ 'listingData.condition': 1 })
listingSchema.index({ 'cardSnapshot.setName': 1 })
listingSchema.index({ 'listingData.certified': 1 })

listingSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

const Listing = mongoose.model('Listing', listingSchema)

export default Listing