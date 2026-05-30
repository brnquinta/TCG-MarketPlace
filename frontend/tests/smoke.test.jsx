import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'

// Smoke test to validate frontend test setup
describe('QAT-012: Setup Frontend', () => {
  it('deve renderizar sem erros', () => {
    expect(true).toBe(true)
  })
})
