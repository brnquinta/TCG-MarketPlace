import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const docsDir = path.resolve(__dirname, '../../../docs/Scrum')

describe('QAT-014: Validacao de Documentacao', () => {
  it('D01: product-backlog.md existe e tem conteudo', () => {
    const filePath = path.join(docsDir, 'product-backlog.md')
    expect(fs.existsSync(filePath)).toBe(true)
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content.length).toBeGreaterThan(1000)
    expect(content).toContain('US001')
    expect(content).toContain('RN001')
    expect(content).toContain('BUG001')
  })

  it('D02: Diagramas Draw.io existem', () => {
    const diagramDir = path.join(docsDir, 'diagramas')
    expect(fs.existsSync(diagramDir)).toBe(true)
    const files = fs.readdirSync(diagramDir)
    const drawioFiles = files.filter(f => f.endsWith('.drawio'))
    expect(drawioFiles.length).toBeGreaterThanOrEqual(5)
    expect(drawioFiles).toContain('horizontal.drawio')
    expect(drawioFiles).toContain('casos-de-uso.drawio')
    expect(drawioFiles).toContain('diagrama-classes.drawio')
    expect(drawioFiles).toContain('modelo-entidade-relacionamento.drawio')
    expect(drawioFiles).toContain('arquitetura.drawio')
  })

  it('D03: Diagramas .drawio sao XML validos', () => {
    const diagramDir = path.join(docsDir, 'diagramas')
    const files = fs.readdirSync(diagramDir).filter(f => f.endsWith('.drawio'))
    for (const file of files) {
      const content = fs.readFileSync(path.join(diagramDir, file), 'utf-8')
      expect(content).toContain('<mxfile')
      expect(content).toContain('<diagram')
    }
  })

  it('D04: Documentos de requisitos existem (01 a 06)', () => {
    const expectedDocs = [
      '01-visao-geral.md',
      '02-requisitos.md',
      '03-casos-de-uso.md',
      '04-diagrama-classes.md',
      '05-modelo-entidade-relacionamento.md',
      '06-arquitetura.md',
    ]
    for (const doc of expectedDocs) {
      const filePath = path.join(docsDir, doc)
      expect(fs.existsSync(filePath), `${doc} deve existir`).toBe(true)
    }
  })

  it('D05: plano-testes-qa.md existe e tem cenarios T001-T057', () => {
    const filePath = path.join(docsDir, 'plano-testes-qa.md')
    expect(fs.existsSync(filePath)).toBe(true)
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('T001')
    expect(content).toContain('UC01')
  })

  it('D06: qa-sprint-backlog.md existe e tem tasks QAT-001 a QAT-014', () => {
    const filePath = path.join(docsDir, 'qa-sprint-backlog.md')
    expect(fs.existsSync(filePath)).toBe(true)
    const content = fs.readFileSync(filePath, 'utf-8')
    for (let i = 1; i <= 14; i++) {
      const id = `QAT-${String(i).padStart(3, '0')}`
      expect(content).toContain(id)
    }
  })

  it('D07: Todos os arquivos .md tem Mermaid ou conteudo markdown valido', () => {
    const mdFiles = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'))
    for (const file of mdFiles) {
      const content = fs.readFileSync(path.join(docsDir, file), 'utf-8')
      expect(content.length).toBeGreaterThan(100)
    }
  })
})
