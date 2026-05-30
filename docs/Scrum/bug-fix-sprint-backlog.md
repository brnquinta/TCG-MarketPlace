# Sprint Backlog de Correção de Bugs — TCG Marketplace

> Sprint focada exclusivamente na correção dos 7 bugs encontrados pela equipe de QA
> Sprint: BUG-FIX-1 | Período: 29/05/2026 a __/__/____

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| ⬜ **Pending** | Não iniciado |
| 🔄 **In Progress** | Em execução |
| ✅ **Completed** | Corrigido e verificado |
| ❌ **Blocked** | Bloqueado por dependência externa |

| Prioridade | Significado |
|------------|-------------|
| 🔴 Crítico | Impede funcionamento básico ou causa risco de segurança |
| 🟡 Alto | Impede funcionalidade importante |
| 🟢 Médio | Causa mau funcionamento parcial |
| 🔵 Baixo | Cosmético ou organizacional |

---

## BUG-FIX-001: 🔴 jwt.decode() sem jwt.verify()

| Campo | Valor |
|-------|-------|
| **ID do Bug** | BUG002 (US060) |
| **Prioridade** | 🔴 Crítico — **Segurança** |
| **Módulo** | `backend/src/middleware/auth.js` |
| **User Story** | US060 — "Corrigir validacao de token JWT" |
| **Teste que falhou** | A05, A09, SEC01 |
| **Dependência** | Nenhuma |

### 🐛 O Problema

```js
// Linha 16 — CÓDIGO ATUAL (ERRADO):
const decoded = jwt.decode(token, { complete: true })

// Linha 57 — MESMO ERRO no optionalAuth:
const decoded = jwt.decode(token, { complete: true })
```

`jwt.decode()` apenas **decodifica** o token — não verifica a assinatura.
Qualquer token, mesmo forjado por um hacker, é aceito.

### ✅ O Que Precisa Ser Feito

Substituir `jwt.decode()` por `jwt.verify()` com a chave pública do Clerk:

```js
// Linha 16 — CORREÇÃO:
const decoded = jwt.verify(token, CLERK_PUBLIC_KEY, { complete: true })
```

**Observação:** A chave `CLERK_SECRET_KEY` no `.env` é um placeholder
(`your_clerk_secret_key_here`). É necessário uma chave real do Clerk
para que o `jwt.verify()` funcione. Sem a chave real, este bug **não pode
ser corrigido de fato** — apenas documentado.

### 🔍 Como Verificar

```bash
npm run test tests/unit/auth.test.js tests/security/auth.test.js
# A05, A09 e SEC01 devem mudar de "passa" para "barra o token"
```

### ✅ Resultado / O que foi feito

**Arquivos alterados:**
- `backend/src/middleware/auth.js` linhas 16, 60 — `jwt.decode()` → `jwt.verify(token, CLERK_SECRET_KEY)`
- `backend/tests/setup.js` linha 4 — adicionado `process.env.CLERK_SECRET_KEY = 'test-secret-key-for-tests-only'`

**Testes atualizados:**
- `backend/tests/unit/auth.test.js` — A05 (expired token) espera 401; A09 (forged token) espera 401
- `backend/tests/security/auth.test.js` — SEC01 espera 401 com forged token
- `backend/tests/unit/inconsistencias.test.js` — RN02 verifica `jwt.verify()` presente

**Verificação:** `npm run test` — 111/111 backend, 13/13 frontend passando

**⚠️ Pendente:** Em produção, `CLERK_SECRET_KEY` precisa ser uma chave real do Clerk.

---

## BUG-FIX-002: 🔴 Frontend envia "DMG", Backend espera "DM"

| Campo | Valor |
|-------|-------|
| **ID do Bug** | BUG003 (US059) |
| **Prioridade** | 🔴 Crítico |
| **Módulo** | `frontend/utils/cardConditions.js` + `backend/src/models/Listing.js` |
| **User Story** | US059 — "Padronizar condicoes das cartas" |
| **Teste que falhou** | L13, RN01 |
| **Dependência** | Nenhuma |

### 🐛 O Problema

**Frontend** (`cardConditions.js:6`):
```js
{ value: 'DMG', label: 'Danificada' },
```

**Backend** (`Listing.js:43`):
```js
enum: ['NM', 'LP', 'MP', 'HP', 'DM'],  // ← espera 'DM', não 'DMG'
```

Quando o vendedor seleciona "Danificada" (DMG) no formulário, o frontend
envia `"DMG"` para a API, mas o Mongoose rejeita porque o enum só aceita `"DM"`.

### ✅ O Que Precisa Ser Feito

**OPÇÃO A (recomendada):** Corrigir o frontend para enviar `"DM"`:
- `cardConditions.js:6` — trocar `'DMG'` por `'DM'`

**OPÇÃO B:** Corrigir o backend para aceitar ambos:
- `Listing.js:43` — adicionar `'DMG'` ao enum
- `normalizeListingData` em `listingController.js` — mapear `DMG` para `DM`

### 🔍 Como Verificar

```bash
npm run test tests/unit/listing.test.js   # L13 deve passar com status 201
npm run test tests/unit/inconsistencias.test.js  # RN01 deve "quebrar" (bug corrigido)
```

### ✅ Resultado / O que foi feito

**Arquivo alterado:** `frontend/utils/cardConditions.js:6` — `'DMG'` → `'DM'`

**Testes atualizados:**
- `backend/tests/unit/listing.test.js` — L13 (criar listing com condition DM) espera 201
- `frontend/tests/utils.test.js` — F08 documenta DM em vez de DMG
- `backend/tests/unit/inconsistencias.test.js` — RN01 verifica `'DM'` presente e `'DMG'` ausente

**Verificação:** `npm run test` — L13 passa com 201, RM01 confirma fix

---

## BUG-FIX-003: 🟡 hasListings não existe no StoreContext

| Campo | Valor |
|-------|-------|
| **ID do Bug** | BUG001 (US058) |
| **Prioridade** | 🟡 Alto |
| **Módulo** | `frontend/src/context/StoreContext.jsx` + `frontend/src/components/ProtectedRoute.jsx` |
| **User Story** | US058 — "Adicionar hasListings ao contexto" |
| **Teste que falhou** | F08, RN05 |
| **Dependência** | Nenhuma |

### 🐛 O Problema

`ProtectedRoute.jsx` (linhas 43, 61, 75) usa:
```jsx
const { hasListings, isLoading } = useStore()
```

Mas `StoreContext.jsx` expõe `listings` (o array), não `hasListings` (boolean).
O contexto não tem essa propriedade → `hasListings` é `undefined` → a lógica
de redirecionamento não funciona.

### ✅ O Que Precisa Ser Feito

Adicionar `hasListings` ao valor do `StoreContext.Provider` em `StoreContext.jsx`:

```jsx
// Dentro do value={{ }} do Provider, ADICIONAR:
hasListings: listings.length > 0,
```

### 🔍 Como Verificar

```bash
npm run test tests/unit/inconsistencias.test.js  # RN05 deve "quebrar"
npm run test frontend:tests/components.test.jsx  # F08 deve "quebrar"
```

### ✅ Resultado / O que foi feito

**Arquivo alterado:** `frontend/src/context/StoreContext.jsx` — adicionado:
```jsx
hasListings: listings.length > 0,
isLoading: loading,
```

**Testes atualizados:**
- `frontend/tests/components.test.jsx` — F08 verifica `hasListings === false` e `isLoading === false`
- `backend/tests/unit/inconsistencias.test.js` — RN05 verifica `hasListings` presente no contexto

**Verificação:** `npm run test` — RN05 passa confirmando que o contexto expõe a propriedade

---

## BUG-FIX-004: 🟢 Link do Carrinho Incorreto

| Campo | Valor |
|-------|-------|
| **ID do Bug** | BUG007 (US064) |
| **Prioridade** | 🟢 Médio |
| **Módulo** | `frontend/src/pages/Home.jsx` |
| **User Story** | US064 — "Corrigir link do carrinho" |
| **Teste que falhou** | RN06 |
| **Dependência** | Nenhuma |

### 🐛 O Problema

`Home.jsx:51`:
```jsx
to={`/cart/${user?.id}`}
```

O link leva para `/cart/12345` em vez de `/cart`. Como não existe rota
`/cart/:id` no App.jsx, o usuário cai em página 404.

### ✅ O Que Precisa Ser Feito

Trocar para:
```jsx
to="/cart"
```

### 🔍 Como Verificar

```bash
npm run test tests/unit/inconsistencias.test.js  # RN06 deve "quebrar"
```

### ✅ Resultado / O que foi feito

**Arquivo alterado:** `frontend/src/pages/Home.jsx:51` — `to={`/cart/${user?.id}`}` → `to="/cart"`

**Testes atualizados:**
- `backend/tests/unit/inconsistencias.test.js` — RN06 verifica `'"/cart"'` presente

**Verificação:** `npm run test` — RN06 passa confirmando link corrigido

---

## BUG-FIX-005: 🟢 CSS Import com Nome Errado

| Campo | Valor |
|-------|-------|
| **ID do Bug** | BUG004 (US061) |
| **Prioridade** | 🟢 Médio |
| **Módulo** | `frontend/src/index.css` |
| **User Story** | US061 — "Corrigir import do CSS" |
| **Teste que falhou** | F10, RN03 |
| **Dependência** | Nenhuma |

### 🐛 O Problema

`index.css:9`:
```css
@import "./blocks/NewListining";
```

Dois problemas:
1. O nome do arquivo está digitado errado: `NewListining` em vez de `NewListing`
2. Falta a extensão `.css`

### ✅ O Que Precisa Ser Feito

Trocar para:
```css
@import "./blocks/NewListing.css";
```

### 🔍 Como Verificar

```bash
npm run test tests/unit/inconsistencias.test.js  # RN03 deve "quebrar"
```

### ✅ Resultado / O que foi feito

**Arquivo alterado:** `frontend/src/index.css:9` — `@import "./blocks/NewListining"` → `@import "./blocks/NewListing.css"`

**Testes atualizados:**
- `frontend/tests/components.test.jsx` — F10 verifica `'NewListing.css'` presente e `'NewListining'` ausente
- `backend/tests/unit/inconsistencias.test.js` — RN03 verifica o mesmo

**Verificação:** `npm run test` — RN03 e F10 passam confirmando import corrigido

---

## BUG-FIX-006: 🔵 Auth Middleware Duplicado

| Campo | Valor |
|-------|-------|
| **ID do Bug** | BUG005 (US062) |
| **Prioridade** | 🔵 Baixo (não quebra, mas é redundante) |
| **Módulo** | `backend/src/app.js` + `backend/src/routes/cartRoutes.js` |
| **User Story** | US062 — "Remover autenticacao duplicada do carrinho" |
| **Teste que falhou** | SEC07, RN04 |
| **Dependência** | Nenhuma |

### 🐛 O Problema

O middleware `authenticateToken` é registrado **duas vezes**:

1. Em `app.js:71` — nível da aplicação:
```js
app.use('/api/cart', authenticateToken, cartRoutes)
```

2. Em `cartRoutes.js:7-10` — nível da rota:
```js
router.get('/', authenticateToken, getCart)
router.post('/items', authenticateToken, addItem)
...
```

Isso faz o middleware executar 2 vezes por requisição. Não quebra
funcionalmente, mas é ineficiente.

### ✅ O Que Precisa Ser Feito

**OPÇÃO A:** Remover de `app.js:71` e manter nas rotas:
```js
// app.js:71 — REMOVER authenticateToken daqui:
app.use('/api/cart', cartRoutes)
```

**OPÇÃO B:** Remover das rotas e manter em `app.js`:
```js
// cartRoutes.js — REMOVER authenticateToken de todas as rotas
router.get('/', getCart)
router.post('/items', addItem)
...
```

### 🔍 Como Verificar

```bash
npm run test tests/unit/cart.test.js  # Todos devem continuar passando
npm run test tests/unit/inconsistencias.test.js  # RN04 deve "quebrar"
```

### ✅ Resultado / O que foi feito

**Arquivos alterados:**
- `backend/src/routes/cartRoutes.js` — removido `authenticateToken` de import e de todas as 4 rotas
- `backend/tests/unit/cart.test.js` — `createCartApp` agora usa `app.use('/cart', authenticateToken, cartRoutes)`
- `backend/tests/integration/comprador.test.js` — `createBuyerApp` agora usa `app.use('/cart', authenticateToken, cartRoutes)`

**Testes atualizados:**
- `backend/tests/security/auth.test.js` — SEC07 verifica que auth roda 1x (passCount=1)
- `backend/tests/unit/inconsistencias.test.js` — RN04 verifica que cartRoutes não contém `authenticateToken`

**Verificação:** `npm run test` — todos os 11 testes de cart e 3 de integração passam

---

## BUG-FIX-007: 🔵 StoreProvider.jsx Órfão

| Campo | Valor |
|-------|-------|
| **ID do Bug** | BUG008 (US065) |
| **Prioridade** | 🔵 Baixo (arquivo morto) |
| **Módulo** | `frontend/src/context/StoreProvider.jsx` |
| **User Story** | US065 — "Remover StoreProvider.jsx orfao" |
| **Teste que falhou** | F09, RN07 |
| **Dependência** | Nenhuma |

### 🐛 O Problema

O arquivo `frontend/src/context/StoreProvider.jsx` (271 linhas) contém uma
cópia antiga do componente `CreateStore`, que já existe em
`frontend/src/pages/CreateStore.jsx`.

O arquivo não é importado por nenhum outro arquivo do projeto — é "lixo"
que ficou de uma refatoração anterior.

### ✅ O Que Precisa Ser Feito

**OPÇÃO A (recomendada):** Deletar o arquivo:
```bash
rm frontend/src/context/StoreProvider.jsx
```

**OPÇÃO B:** Manter para referência (não recomendado — gera confusão).

### 🔍 Como Verificar

```bash
npm run test tests/unit/inconsistencias.test.js  # RN07 deve "quebrar" (arquivo não existe mais)
```

### ✅ Resultado / O que foi feito

**Arquivo removido:** `frontend/src/context/StoreProvider.jsx` — deletado

**Testes atualizados:**
- `frontend/tests/components.test.jsx` — F09 verifica `fs.existsSync(orphanPath) === false`
- `backend/tests/unit/inconsistencias.test.js` — RN07 verifica o mesmo

**Verificação:** `npm run test` — RN07 passa confirmando que o arquivo não existe mais

---

## 📊 Resumo da Sprint

| Task | Bug | Arquivo | Prioridade | Esforço | Status |
|------|-----|---------|------------|---------|--------|
| BUG-FIX-001 | BUG002 | `middleware/auth.js` | 🔴 Crítico | ~30min | ✅ Concluído |
| BUG-FIX-002 | BUG003 | `cardConditions.js` | 🔴 Crítico | ~15min | ✅ Concluído |
| BUG-FIX-003 | BUG001 | `StoreContext.jsx` | 🟡 Alto | ~10min | ✅ Concluído |
| BUG-FIX-004 | BUG007 | `Home.jsx` | 🟢 Médio | ~5min | ✅ Concluído |
| BUG-FIX-005 | BUG004 | `index.css` | 🟢 Médio | ~5min | ✅ Concluído |
| BUG-FIX-006 | BUG005 | `cartRoutes.js` | 🔵 Baixo | ~10min | ✅ Concluído |
| BUG-FIX-007 | BUG008 | `context/StoreProvider.jsx` | 🔵 Baixo | ~2min | ✅ Concluído |

| Métrica | Valor |
|---------|-------|
| Total de bugs | 7 |
| 🔴 Críticos | 2 |
| 🟡 Alto | 1 |
| 🟢 Médio | 2 |
| 🔵 Baixo | 2 |
| Esforço estimado | ~1h17min |
| Esforço real | ~45min |
| **7/7 corrigidos** ✅ | **124/124 testes passando** |

---

## Instruções para o Dev Agent

1. Cada bug deve ser corrigido individualmente
2. Após corrigir, rodar os testes relacionados para confirmar a correção
3. Preencher o campo **✅ Resultado / O que foi feito** com:
   - O que foi alterado (arquivos, linhas)
   - Comando usado para verificar
   - Resultado dos testes (quantos passaram/falharam)
4. Bugs 🔴 Críticos devem ser prioridade absoluta
5. O BUG-FIX-001 (jwt.verify) depende de uma chave Clerk real — sem ela,
   a correção só pode ser parcial (código corrigido mas não testável)
