import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user?.clerkId || 'anonymous'
    const uploadPath = path.join(__dirname, '../../uploads/listings', userId)
    fs.mkdirSync(uploadPath, { recursive: true })
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const timestamp = Date.now()
    const photoType = file.fieldname
    cb(null, `${timestamp}_${photoType}${ext}`)
  },
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Tipo de arquivo não suportado. Envie imagens (JPG, PNG, WEBP).'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
})

export const uploadListingPhotos = (req, res) => {
  const uploadFields = upload.fields([
    { name: 'front90', maxCount: 1 },
    { name: 'back90', maxCount: 1 },
    { name: 'front45', maxCount: 1 },
    { name: 'back45', maxCount: 1 },
  ])

  uploadFields(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err.message)
      return res.status(400).json({ error: err.message })
    }

    const userId = req.user?.clerkId || 'anonymous'
    const photos = {}

    const fieldMap = {
      front90: 'front90',
      back90: 'back90',
      front45: 'front45',
      back45: 'back45',
    }

    for (const [key, fieldName] of Object.entries(fieldMap)) {
      if (req.files[fieldName] && req.files[fieldName][0]) {
        photos[key] = `/uploads/listings/${userId}/${req.files[fieldName][0].filename}`
      }
    }

    return res.json(photos)
  })
}
