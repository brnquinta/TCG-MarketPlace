import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const backendRoot = path.resolve(__dirname, '../..')
const frontendRoot = path.resolve(__dirname, '../../../frontend')

describe('QAT-013: Inconsistencias Conhecidas', () => {
  it('RN01 (BUG003): ✅ CORRIGIDO — frontend e backend usam DM', () => {
    const conditionsPath = path.join(frontendRoot, 'utils', 'cardConditions.js')
    const content = fs.readFileSync(conditionsPath, 'utf-8')

    // Frontend agora usa 'DM'
    expect(content).toContain("'DM'")
    expect(content).not.toContain("'DMG'")

    const listingModelPath = path.join(backendRoot, 'src', 'models', 'Listing.js')
    const modelContent = fs.readFileSync(listingModelPath, 'utf-8')

    // Backend tem 'DM' no enum
    expect(modelContent).toContain("'DM'")
  })

  it('RN02 (BUG002): ✅ CORRIGIDO — auth middleware usa Clerk verifyToken', () => {
    const authPath = path.join(backendRoot, 'src', 'middleware', 'auth.js')
    const content = fs.readFileSync(authPath, 'utf-8')

    // Nao usa mais jwt.decode
    expect(content).not.toContain('jwt.decode(')

    // Usa Clerk verifyToken do SDK
    const verifyMatches = content.match(/verifyToken/g)
    expect(verifyMatches).not.toBeNull()

    // Usa CLERK_SECRET_KEY
    expect(content).toContain('CLERK_SECRET_KEY')

    // Importa do Clerk SDK
    expect(content).toContain("@clerk/clerk-sdk-node'")
  })

  it('RN03 (BUG004): ✅ CORRIGIDO — CSS import "NewListing.css"', () => {
    const cssPath = path.join(frontendRoot, 'src', 'index.css')
    const content = fs.readFileSync(cssPath, 'utf-8')

    // Nao tem mais o typo
    expect(content).not.toContain('NewListining')
    // Tem o nome correto com extensao
    expect(content).toContain('NewListing.css')
  })

  it('RN05 (BUG001): ✅ CORRIGIDO — hasListings existe no StoreContext', () => {
    const contextPath = path.join(frontendRoot, 'src', 'context', 'StoreContext.jsx')
    const contextContent = fs.readFileSync(contextPath, 'utf-8')

    // Contexto agora tem hasListings
    expect(contextContent).toContain('hasListings')
    // E isLoading como alias de loading
    expect(contextContent).toContain('isLoading: loading')
  })

  it('RN06 (BUG007): ✅ CORRIGIDO — Link do carrinho usa /cart', () => {
    const homePath = path.join(frontendRoot, 'src', 'pages', 'Home.jsx')
    const content = fs.readFileSync(homePath, 'utf-8')
    // Link agora usa /cart sem template string
    expect(content).toContain('"/cart"')
  })

  it('RN04 (BUG005): ✅ CORRIGIDO — auth removido das rotas cartRoutes', () => {
    const appPath = path.join(backendRoot, 'src', 'app.js')
    const appContent = fs.readFileSync(appPath, 'utf-8')

    const cartRoutesPath = path.join(backendRoot, 'src', 'routes', 'cartRoutes.js')
    const cartRoutesContent = fs.readFileSync(cartRoutesPath, 'utf-8')

    // app.js ainda tem authenticateToken no /api/cart
    expect(appContent).toContain("authenticateToken, cartRoutes")

    // cartRoutes.js nao tem mais authenticateToken
    expect(cartRoutesContent).not.toContain('authenticateToken')
  })

  it('RN07 (BUG008): ✅ CORRIGIDO — StoreProvider.jsx removido', () => {
    const orphanPath = path.join(frontendRoot, 'src', 'context', 'StoreProvider.jsx')
    const orphanExists = fs.existsSync(orphanPath)
    expect(orphanExists).toBe(false)
  })
})
