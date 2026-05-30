import { describe, it, expect } from 'vitest'
import mongoose from 'mongoose'

describe('Setup do Ambiente', () => {
  it('deve conectar ao MongoDB em memoria', () => {
    expect(mongoose.connection.readyState).toBe(1)
  })

  it('deve permitir criar e consultar um documento', async () => {
    const TestModel = mongoose.model('Test', new mongoose.Schema({ name: String }))
    await TestModel.create({ name: 'teste' })
    const doc = await TestModel.findOne({ name: 'teste' })
    expect(doc).not.toBeNull()
    expect(doc.name).toBe('teste')
  })

  it('deve limpar documentos entre testes', async () => {
    const collections = mongoose.connection.collections
    let totalDocs = 0
    for (const key in collections) {
      totalDocs += await collections[key].countDocuments()
    }
    expect(totalDocs).toBe(0)
  })
})
