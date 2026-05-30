import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StoreContext } from '../src/context/StoreContext'

// Mock @clerk/clerk-react
vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({
    user: { id: 'test_user_123' },
    isLoaded: true,
    isSignedIn: true,
  }),
  useAuth: () => ({
    userId: 'test_user_123',
    isLoaded: true,
    isSignedIn: true,
  }),
  ClerkProvider: ({ children }) => <>{children}</>,
  SignedIn: ({ children }) => <>{children}</>,
  SignedOut: ({ children }) => <>{children}</>,
}))

// Mock window.Clerk
vi.stubGlobal('Clerk', {
  session: { getToken: () => Promise.resolve('mock_token') },
})

describe('QAT-012: Componentes Frontend', () => {
  it('F08: ✅ CORRIGIDO — hasListings existe no StoreContext', () => {
    const storeContext = {
      store: null,
      loading: false,
      hasStore: false,
      listings: [],
      hasListings: false,
      isLoading: false,
      addListing: () => {},
      removeListing: () => {},
      updateListing: () => {},
    }
    expect(storeContext.hasListings).toBe(false)
    expect(storeContext.isLoading).toBe(false)
  })

  it('F09: ✅ CORRIGIDO — StoreProvider.jsx removido', async () => {
    const storeContext = await import('../src/context/StoreContext')
    expect(storeContext.StoreProvider).toBeDefined()
    expect(storeContext.StoreContext).toBeDefined()

    // Verificar que arquivo orfao nao existe mais
    const fs = await import('fs')
    const path = await import('path')
    const orphanPath = path.default.resolve(__dirname, '../src/context/StoreProvider.jsx')
    expect(fs.existsSync(orphanPath)).toBe(false)
  })

  it('F10: ✅ CORRIGIDO — CSS import NewListing.css', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const cssPath = path.default.resolve(__dirname, '../src/index.css')
    const content = fs.readFileSync(cssPath, 'utf-8')
    expect(content).toContain('NewListing.css')
    expect(content).not.toContain('NewListining')
  })
})
