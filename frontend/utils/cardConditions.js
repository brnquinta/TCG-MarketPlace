export const CARD_CONDITIONS = [
  { value: 'NM', label: 'Perto de nova' },
  { value: 'LP', label: 'Levemente jogada' },
  { value: 'MP', label: 'Moderadamente jogada' },
  { value: 'HP', label: 'Muito jogada' },
  { value: 'DMG', label: 'Danificada' },
]

export const CARD_CONDITION_FILTER_OPTIONS = [
  { value: '', label: 'Todas' },
  ...CARD_CONDITIONS,
]

export const CARD_CONDITION_FORM_OPTIONS = [
  { value: '', label: 'Selecione' },
  ...CARD_CONDITIONS,
]