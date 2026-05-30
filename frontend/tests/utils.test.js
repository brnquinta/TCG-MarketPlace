import { describe, it, expect } from 'vitest'
import { CARD_CONDITIONS, CARD_CONDITION_FILTER_OPTIONS, CARD_CONDITION_FORM_OPTIONS } from '../utils/cardConditions'
import { CARD_LANGUAGES, CARD_LANGUAGE_FILTER_OPTIONS, CARD_LANGUAGE_FORM_OPTIONS } from '../utils/cardLanguages'

describe('cardConditions', () => {
  it('F08: ✅ CORRIGIDO — conditions usam DM (compativel com backend)', () => {
    const dm = CARD_CONDITIONS.find(c => c.value === 'DM')
    expect(dm).toBeDefined()
    expect(dm.label).toBe('Danificada')
  })

  it('deve ter 5 condicoes', () => {
    expect(CARD_CONDITIONS).toHaveLength(5)
  })

  it('CARD_CONDITION_FILTER_OPTIONS deve ter opcao vazia + 5 condicoes', () => {
    expect(CARD_CONDITION_FILTER_OPTIONS).toHaveLength(6)
    expect(CARD_CONDITION_FILTER_OPTIONS[0].value).toBe('')
    expect(CARD_CONDITION_FILTER_OPTIONS[0].label).toBe('Todas')
  })

  it('CARD_CONDITION_FORM_OPTIONS deve ter opcao Selecione + 5 condicoes', () => {
    expect(CARD_CONDITION_FORM_OPTIONS).toHaveLength(6)
    expect(CARD_CONDITION_FORM_OPTIONS[0].value).toBe('')
    expect(CARD_CONDITION_FORM_OPTIONS[0].label).toBe('Selecione')
  })

  it('NM deve ser Perto de nova, LP Levemente jogada, MP Moderadamente jogada, HP Muito jogada', () => {
    const labels = {
      NM: 'Perto de nova',
      LP: 'Levemente jogada',
      MP: 'Moderadamente jogada',
      HP: 'Muito jogada',
    }
    for (const [value, expectedLabel] of Object.entries(labels)) {
      const condition = CARD_CONDITIONS.find(c => c.value === value)
      expect(condition).toBeDefined()
      expect(condition.label).toBe(expectedLabel)
    }
  })
})

describe('cardLanguages', () => {
  it('deve ter opcoes de idioma', () => {
    expect(Array.isArray(CARD_LANGUAGES)).toBe(true)
    expect(CARD_LANGUAGES.length).toBeGreaterThan(0)
  })

  it('CARD_LANGUAGE_FILTER_OPTIONS deve ter Todos + idiomas', () => {
    expect(CARD_LANGUAGE_FILTER_OPTIONS.length).toBe(CARD_LANGUAGES.length + 1)
    expect(CARD_LANGUAGE_FILTER_OPTIONS[0].value).toBe('')
    expect(CARD_LANGUAGE_FILTER_OPTIONS[0].label).toBe('Todos')
  })

  it('CARD_LANGUAGE_FORM_OPTIONS deve ter PT-BR, EN, JP', () => {
    expect(CARD_LANGUAGE_FORM_OPTIONS).toHaveLength(3)
    expect(CARD_LANGUAGE_FORM_OPTIONS[0].value).toBe('PT-BR')
    expect(CARD_LANGUAGE_FORM_OPTIONS[1].value).toBe('EN')
    expect(CARD_LANGUAGE_FORM_OPTIONS[2].value).toBe('JP')
  })

  it('CARD_LANGUAGES usa valores como portugues, ingles, japones', () => {
    const langs = CARD_LANGUAGES.map(l => l.value)
    expect(langs).toContain('portugues')
    expect(langs).toContain('ingles')
    expect(langs).toContain('japones')
    expect(langs).toContain('espanhol')
    expect(langs).toContain('outros')
  })
})
