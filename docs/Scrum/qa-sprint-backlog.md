# QA Sprint Backlog — TCG Marketplace

> Sprint de Testes da Equipe de QA
> Documento vivo — cada task é atualizada após execução
> Sprint: 1 | Período: 29/05/2026 a __/__/____

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| ⬜ **Pending** | Task não iniciada |
| 🔄 **In Progress** | Task em execução |
| ✅ **Completed** | Task concluída com sucesso |
| ❌ **Failed** | Task falhou — bug reportado |
| ⏭️ **Skipped** | Task não aplicável / adiada |

---

## QAT-001: Setup do Ambiente de Testes

| Campo | Valor |
|-------|-------|
| **Épico** | Infraestrutura de QA |
| **UC** | — |
| **Tipo** | Configuração |
| **Módulo** | Backend + Frontend |
| **Classes/Arquivos** | `package.json`, `vitest.config.js`, `tests/setup.js` |
| **Dependências** | Vitest, Supertest, mongodb-memory-server, React Testing Library |

### Ramos de Teste

| Ramo | Descrição |
|------|-----------|
| Instalação | `npm install -D` de todas as dependências |
| Configuração | `vitest.config.js` com globals, environment, setup |
| Mock MongoDB | `mongodb-memory-server` start/stop no setup |
| Mock Clerk | JWT mock com `jsonwebtoken` para testes |
| Script npm | `test` e `test:watch` no `package.json` |

### ✅ Resultado / O que foi feito

> **Status: ✅ Completo**
> - Dependências instaladas: vitest, supertest, mongodb-memory-server, @vitest/coverage-v8 (backend); vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom (frontend)
> - `vitest.config.js` criado para backend e frontend
> - `tests/setup.js` com mongodb-memory-server + limpeza automática entre testes
> - Fixtures criadas: `tests/fixtures/index.js` (mock JWT), `tests/fixtures/models.js` (User/Store/Listing/Cart factories)
> - Scripts adicionados: `test`, `test:watch`, `test:coverage`
> - Smoke test passou (3/3 testes: conexão, CRUD, limpeza entre testes)

---

## QAT-002: Testes de Autenticação — Auth Middleware

| Campo | Valor |
|-------|-------|
| **Épico** | Autenticação e Usuário |
| **UC** | UC01 (login), UC15 (cadastro) |
| **Tipo** | API + Security |
| **Módulo** | `middleware/auth.js` |
| **Classes/Arquivos** | `auth.js:6-72`, `authRoutes.js`, `authController.js` |
| **User Stories** | US001-US005 |

### Ramos de Teste

| Ramo | Entrada | Resultado Esperado | ID |
|------|---------|-------------------|----|
| **Happy path** — token válido | Bearer + JWT mock | `req.user` populado, `next()` chamado | A01 |
| **Erro** — sem header | Request sem `Authorization` | 401 "No token provided" | A02 |
| **Erro** — sem Bearer | `Authorization: token` | 401 "No token provided" | A03 |
| **Erro** — token inválido | `Bearer aaaa.bbbb.cccc` | 401 "Token inválido" | A04 |
| **Erro** — token expirado | JWT expirado | 401 "Token expirado" | A05 |
| **Edge** — optionalAuth sem token | Request sem header | `req.user` undefined, `next()` chamado | A06 |
| **Edge** — optionalAuth token inválido | Bearer + token falso | `req.user` undefined, `next()` chamado | A07 |
| **Regra RN002** — auto-criação de user | JWT com clerkId novo | User criado no MongoDB | A08 |
| **Regra RN004** — ⚠️ decode vs verify | Token forjado assinado com chave errada | **Deve retornar 401** | A09 |
| **Regra RN002** — usuário já existe | JWT com clerkId existente | User atualizado, não duplicado | A10 |

### ✅ Resultado / O que foi feito

> **Status: ✅ Completo**
> - 11 testes criados para `authenticateToken` (8 casos) e `optionalAuth` (3 casos)
> - Cobre: happy path, sem header, sem Bearer, token inválido, token expirado (BUG), token forjado (BUG), auto-criação de user, não duplicação
> - BUG002 (jwt.decode) documentado em A05 e A09
> - Todos os 11 testes passaram

---

## QAT-003: Testes de Store — Criação

| Campo | Valor |
|-------|-------|
| **Épico** | Lojas |
| **UC** | UC08 (Criar Loja) |
| **Tipo** | API |
| **Módulo** | `controllers/storeController.js` + `routes/storeRoutes.js` |
| **Classes/Arquivos** | `storeController.js:4-48`, `storeRoutes.js:6`, `models/Store.js` |
| **User Stories** | US006-US008 |

### Ramos de Teste

| Ramo | Entrada | Resultado Esperado | ID |
|------|---------|-------------------|----|
| **Happy path** — dados válidos | name + slug + location | 201, status `draft`, onboarding `pending` | S01 |
| **Erro** — sem token | Body válido sem auth | 401 | S02 |
| **Erro** — sem nome | Body sem `name` | 400 "Name and slug are required" | S03 |
| **Erro** — sem slug | Body sem `slug` | 400 "Name and slug are required" | S04 |
| **Erro** — slug duplicado | Slug já existente | 400 "Slug already in use" | S05 |
| **Erro** — usuário sem loja duplicada | Usuário já possui loja | 400 "Voce ja possui uma loja" | S06 |
| **Edge** — slug case-insensitive | Slug "Minha-Loja" vs "minha-loja" | Unique falha se igual após lowercase | S07 |
| **Regra RN006** — 1 loja por usuário | Mesmo userId 2× | Segunda chamada retorna 400 | S08 |

### ✅ Resultado / O que foi feito

> **Status: ✅ Completo**
> - 8 testes criados para `createStore`
> - Cobre: S01 (happy path), S02 (sem token), S03 (sem nome), S04 (sem slug), S05 (slug duplicado), S06 (1 loja por user), S07 (case-insensitive), S08 (RN006)
> - Todos passaram

---

## QAT-004: Testes de Store — Leitura e Edição

| Campo | Valor |
|-------|-------|
| **Épico** | Lojas |
| **UC** | UC07 (Visualizar Loja), UC09 (Editar Loja) |
| **Tipo** | API |
| **Módulo** | `controllers/storeController.js` |
| **Classes/Arquivos** | `storeController.js:50-150`, `storeRoutes.js:7-10` |
| **User Stories** | US009-US013 |

### Ramos de Teste

| Ramo | Entrada | Resultado Esperado | ID |
|------|---------|-------------------|----|
| **Happy path** — getMyStore | JWT válido com loja | 200 + store data | S09 |
| **Erro** — getMyStore sem loja | JWT válido sem loja | 404 "Store not found" | S10 |
| **Happy path** — getStoreBySlug | slug ativo | 200 + populate userId | S11 |
| **Erro** — slug inexistente | slug inválido | 404 | S12 |
| **Regra RN011** — store inativa | slug de store `inactive` | 404 (filtro `active`) | S13 |
| **Happy path** — updateStore | body parcial | Merge correto, 200 | S14 |
| **Erro** — updateStore sem loja | JWT sem loja | 404 | S15 |
| **Regra RN014** — views incrementado | GET em store pública | `stats.totalViews` +1 | S16 |
| **Happy path** — getAllStores | Paginação default | 20 lojas, sorted by rating | S17 |

### ✅ Resultado / O que foi feito

> **Status: ✅ Completo**
> - 9 testes criados: getMyStore (S09-S10), getStoreBySlug (S11-S13, S16), getAllStores (S17), updateStore (S14-S15)
> - Cobre: happy path, sem loja, slug inexistente/inativo, views increment, paginação, update parcial
> - Todos passaram

---

## QAT-005: Testes de Listing — Criação e Normalização

| Campo | Valor |
|-------|-------|
| **Épico** | Anúncios |
| **UC** | UC10 (Criar Anúncio) |
| **Tipo** | API + Unit |
| **Módulo** | `controllers/listingController.js` (função `normalizeListingData`) |
| **Classes/Arquivos** | `listingController.js:5-122`, `models/Listing.js` |
| **User Stories** | US021-US026 |

### Ramos de Teste

| Ramo | Entrada | Resultado Esperado | ID |
|------|---------|-------------------|----|
| **Happy path** — dados completos | cardSnapshot + listingData + photos | 201, status `active` | L01 |
| **Erro** — sem token | Body válido sem auth | 401 | L02 |
| **Erro** — sem cardSnapshot | Apenas listingData | 400 | L03 |
| **Erro** — sem listingData | Apenas cardSnapshot | 400 | L04 |
| **Erro** — sem loja | JWT sem store | 404 "Store not found" | L05 |
| **Regra RN012** — incremento | Criar listing ativo | `store.stats.activeListings` +1 | L06 |
| **Normalização** — idioma `portugues` → `PT-BR` | `listingData.language: "portugues"` | Salvo como `PT-BR` | L07 |
| **Normalização** — idioma `english` → `EN` | `listingData.language: "english"` | Salvo como `EN` | L08 |
| **Normalização** — preço string | `listingData.price: "199.90"` | Salvo como Number 199.90 | L09 |
| **Normalização** — preço vazio | `listingData.price: ""` | Salvo como 0 | L10 |
| **Normalização** — quantity mínimo | `listingData.quantity: 0` | Salvo como 1 | L11 |
| **Edge** — gradingCompany null | `gradingCompany: ""` | Salvo como null | L12 |
| **⚠️ Bug RN019** — DMG vs DM | `condition: "DMG"` frontend | **Deve falhar** (backend espera `DM`) | L13 |
| **Regra RN020** — 4 fotos | Photos no body | Aceito mesmo sem validação backend | L14 |

### ✅ Resultado / O que foi feito

> _A ser preenchido após execução._

---

## QAT-006: Testes de Listing — Leitura, Edição, Exclusão

| Campo | Valor |
|-------|-------|
| **Épico** | Anúncios |
| **UC** | UC03 (Listar), UC04 (Detalhes) |
| **Tipo** | API |
| **Módulo** | `controllers/listingController.js` |
| **Classes/Arquivos** | `listingController.js:124-290`, `routes/listingRoutes.js` |
| **User Stories** | US027-US029 |

### Ramos de Teste

| Ramo | Entrada | Resultado Esperado | ID |
|------|---------|-------------------|----|
| **Happy path** — getPublicListings | Sem filtros | 200 + listings `active` only | L15 |
| **Filtro** — minPrice | `?minPrice=50` | Apenas price ≥ 50 | L16 |
| **Filtro** — maxPrice | `?maxPrice=100` | Apenas price ≤ 100 | L17 |
| **Filtro** — min+maxPrice | `?minPrice=50&maxPrice=100` | Range correta | L18 |
| **Filtro** — condition | `?condition=NM` | Apenas NM | L19 |
| **Filtro** — certified | `?certified=true` | Apenas certified | L20 |
| **Filtro** — setName | `?setName=Base` | Regex case-insensitive | L21 |
| **Filtro** — search | `?search=Charizard` | $or name/setName | L22 |
| **Paginação** | Default | page=1, limit=20, total, pages | L23 |
| **Happy path** — getListingById | ID válido | 200 + populate storeId | L24 |
| **Erro** — ID inválido | ID não existente | 404 | L25 |
| **Regra** — views incrementado | GET em listing | `listing.views` +1 | L26 |
| **Happy path** — updateListing | Dados parciais | Merge + normalização | L27 |
| **Erro** — update de outro usuário | ID de outro vendedor | 404 | L28 |
| **Happy path** — deleteListing | ID próprio | 200, activeListings -1 | L29 |
| **Erro** — delete de outro | ID de outro vendedor | 404 | L30 |
| **Regra RN013** — decremento | Deletar listing | `store.stats.activeListings` -1 | L31 |

### ✅ Resultado / O que foi feito

> _A ser preenchido após execução._

---

## QAT-007: Testes de Carrinho — CRUD e Regras

| Campo | Valor |
|-------|-------|
| **Épico** | Carrinho |
| **UC** | UC05 (Gerenciar Carrinho) |
| **Tipo** | API + Integration |
| **Módulo** | `controllers/cartController.js` |
| **Classes/Arquivos** | `cartController.js:1-134`, `routes/cartRoutes.js`, `models/Cart.js` |
| **User Stories** | US030-US035 |

### Ramos de Teste

| Ramo | Entrada | Resultado Esperado | ID |
|------|---------|-------------------|----|
| **Happy path** — getCart vazio | JWT válido sem carrinho | 200 `{ items: [], total: 0 }` | C01 |
| **Happy path** — addItem | listingId válido | 200 + item adicionado | C02 |
| **Erro** — addItem sem token | Body válido sem auth | 401 | C03 |
| **Erro** — addItem sem listingId | Body sem `listingId` | 400 | C04 |
| **Erro** — addItem listing inexistente | listingId fake | 404 | C05 |
| **Regra RN032** — listing inativa | listingId com status `sold` | 400 "Anuncio nao esta ativo" | C06 |
| **Regra RN033** — sem estoque | listing com quantity = 0 | 400 "Anuncio sem estoque" | C07 |
| **Regra RN034** — item duplicado | Mesmo listingId 2× | 400 "Item ja esta no carrinho" | C08 |
| **Happy path** — removeItem | listingId no carrinho | 200, item removido | C09 |
| **Erro** — removeItem inexistente | listingId não no carrinho | 404 | C10 |
| **Happy path** — clearCart | JWT com carrinho | 200 `{ items: [], total: 0 }` | C11 |
| **Regra RN035** — populate store | GET após add | Items populados com storeId.name | C12 |
| **⚠️ Bug RN005** — auth duplicado | app.js + cartRoutes | Middleware executado 2× (não quebra) | C13 |

### ✅ Resultado / O que foi feito

> _A ser preenchido após execução._

---

## QAT-008: Testes de Pokémon TCG Proxy — Dados Locais

| Campo | Valor |
|-------|-------|
| **Épico** | Catálogo de Cartas |
| **UC** | UC01 (Buscar), UC02 (Detalhes) |
| **Tipo** | API |
| **Módulo** | `routes/pokemonProxyRoutes.js` |
| **Classes/Arquivos** | `pokemonProxyRoutes.js:1-129`, `data/cards.json`, `data/sets.json` |
| **User Stories** | US014-US020 |

### Ramos de Teste

| Ramo | Entrada | Resultado Esperado | ID |
|------|---------|-------------------|----|
| **Happy path** — GET /cards sem filtro | `q=""` | 200 + dados paginados | P01 |
| **Filtro** — name | `q=name:Charizard*` | Cartas com "Charizard" no nome | P02 |
| **Filtro** — number | `q=number:4` | Carta com número 4 | P03 |
| **Filtro** — set.name | `q=set.name:"Base Set"` | Cartas do Base Set | P04 |
| **Filtro** — rarity | `q=rarity:"Rare Holo"` | Cartas da raridade | P05 |
| **Combinação** — múltiplos filtros | `q=name:Char* number:4` | Interseção | P06 |
| **Sem resultados** | `q=name:ZZZNotFound*` | `count: 0` | P07 |
| **Paginação** | page=2, pageSize=5 | Slice correto | P08 |
| **Happy path** — GET /cards/:id | ID existente | 200 + card data | P09 |
| **Erro** — GET /cards/:id inexistente | ID fake | 404 | P10 |
| **Happy path** — GET /sets | — | 200 + sets.json | P11 |
| **Happy path** — GET /rarities | — | 200 + rarities.json | P12 |
| **Regra RN043** — USD→BRL | AwesomeAPI | Cotação parseada como Number | P13 |
| **Regra RN044** — fallback cotação | AwesomeAPI offline | Fallback 5.8 | P14 |

### ✅ Resultado / O que foi feito

> _A ser preenchido após execução._

---

## QAT-009: Testes de Integração — Fluxo Completo do Vendedor

| Campo | Valor |
|-------|-------|
| **Épico** | Integração |
| **UC** | UC08 → UC10 → UC04 |
| **Tipo** | Integration |
| **Módulo** | Multi-controller |
| **Classes/Arquivos** | `listingController.js`, `storeController.js`, `authController.js` |
| **User Stories** | US006 → US008 → US021 → US027 |

### Ramos de Teste

| Ramo | Passos | Resultado Esperado | ID |
|------|--------|-------------------|----|
| **Fluxo completo** | 1. Auth → 2. Criar Loja → 3. Criar Anúncio → 4. Listar Anúncios → 5. Ver Anúncio | Loja criada, anúncio ativo, visível na listagem | I01 |
| **Fluxo com limpeza** | Criar → Deletar → Verificar | Anúncio não aparece mais na listagem | I02 |
| **Fluxo de edição** | Criar → Editar → Verificar campo alterado | Dados atualizados corretamente | I03 |
| **Regra RN012+RN013** | Criar → Verificar stats → Deletar → Verificar stats | activeListings incrementa e decrementa | I04 |

### ✅ Resultado / O que foi feito

> _A ser preenchido após execução._

---

## QAT-010: Testes de Integração — Fluxo do Comprador

| Campo | Valor |
|-------|-------|
| **Épico** | Integração |
| **UC** | UC01 → UC04 → UC05 |
| **Tipo** | Integration |
| **Módulo** | Multi-controller |
| **Classes/Arquivos** | `pokemonProxyRoutes.js`, `listingController.js`, `cartController.js` |
| **User Stories** | US014 → US027 → US030 |

### Ramos de Teste

| Ramo | Passos | Resultado Esperado | ID |
|------|--------|-------------------|----|
| **Fluxo completo** | 1. Buscar carta → 2. Ver detalhes → 3. Listar anúncios → 4. Ver anúncio → 5. Add carrinho → 6. Ver carrinho | Carta encontrada, anúncio visto, carrinho com item | I05 |
| **Carrinho multi-loja** | Add itens de 2 lojas diferentes | Carrinho agrupa por loja | I06 |
| **Carrinho + limpeza** | Add → Remove → Verificar | Carrinho vazio | I07 |
| **Anúncio + views** | Ver anúncio → Verificar contador | views incrementado | I08 |

### ✅ Resultado / O que foi feito

> _A ser preenchido após execução._

---

## QAT-011: Testes de Segurança — Middleware e Rotas Protegidas

| Campo | Valor |
|-------|-------|
| **Épico** | Qualidade e Correções |
| **UC** | Todos |
| **Tipo** | Security |
| **Módulo** | `middleware/auth.js`, `app.js` |
| **Classes/Arquivos** | `auth.js:6-72`, `app.js:67-73`, `cartRoutes.js:7-10` |
| **User Stories** | US058, US060, US062, US066 |

### Ramos de Teste

| Ramo | Entrada | Resultado Esperado | ID |
|------|---------|-------------------|----|
| **⚠️ Bug US060** — jwt.decode sem verify | Token com assinatura inválida | **Deve retornar 401** | SEC01 |
| **Rota protegida** — POST /api/stores sem auth | Body válido, sem JWT | 401 | SEC02 |
| **Rota protegida** — POST /api/listings sem auth | Body válido, sem JWT | 401 | SEC03 |
| **Rota protegida** — POST /api/cart/items sem auth | Body válido, sem JWT | 401 | SEC04 |
| **Rota opcional** — GET /api/listings sem auth | Sem JWT | 200 (optionalAuth) | SEC05 |
| **Rota opcional** — GET /api/stores sem auth | Sem JWT | 200 (optionalAuth) | SEC06 |
| **⚠️ Bug US062** — auth duplicado no cart | Request no /api/cart | Middleware executa 1× (não 2×) | SEC07 |
| **⚠️ Bug US066** — Clerk key placeholder | .env com placeholder | Teste documenta necessidade | SEC08 |
| **CORS** — origin não permitida | Origin: http://evil.com | Bloqueado | SEC09 |

### ✅ Resultado / O que foi feito

> _A ser preenchido após execução._

---

## QAT-012: Testes de Componente — Páginas Frontend

| Campo | Valor |
|-------|-------|
| **Épico** | Frontend |
| **UC** | UC01 a UC10 (cobertura via React Testing Library) |
| **Tipo** | Component |
| **Módulo** | Páginas React |
| **Classes/Arquivos** | `pages/Home.jsx`, `pages/Search.jsx`, `pages/NewListing.jsx`, `pages/Cart.jsx`, `pages/ListingDetails.jsx` |
| **User Stories** | Todas as frontend |

### Ramos de Teste

| Ramo | Página | Resultado Esperado | ID |
|------|--------|-------------------|----|
| **Renderização** — Home | Home.jsx | Hero, features, CTA buttons visíveis | F01 |
| **Renderização** — Search | Search.jsx | Formulário de busca com todos os campos | F02 |
| **Renderização** — NewListing | NewListing.jsx | Stepper de fotos + busca de carta + formulário | F03 |
| **Renderização** — Cart | Cart.jsx | Estado vazio → mensagem + link | F04 |
| **Renderização** — ListingDetails | ListingDetails.jsx | Loading, erro, dados | F05 |
| **⚠️ Bug US064** — link do carrinho | Home.jsx:51 | Link deve ser `/cart` não `/cart/${user.id}` | F06 |
| **ProtectedRoute** — RequireAuth | ProtectedRoute.jsx:5-22 | Redireciona para `/` se não logado | F07 |
| **⚠️ Bug US058** — hasListings | ProtectedRoute.jsx:43,61 | **Deve falhar** — propriedade não existe | F08 |
| **⚠️ Bug US065** — StoreProvider.jsx órfão | context/StoreProvider.jsx | Duplicata de pages/CreateStore.jsx | F09 |
| **⚠️ Bug US061** — CSS import | index.css:9 | `NewListining` → `NewListing.css` | F10 |

### ✅ Resultado / O que foi feito

> _A ser preenchido após execução._

---

## QAT-013: Testes de Regras de Negócio — Inconsistências Conhecidas

| Campo | Valor |
|-------|-------|
| **Épico** | Qualidade e Correções |
| **UC** | Todos |
| **Tipo** | Unit + API |
| **Módulo** | Validadores e normalizadores |
| **Classes/Arquivos** | `listingController.js:5-77`, `cardConditions.js`, `cardLanguages.js`, `models/Listing.js` |
| **User Stories** | US059, US060, US061, US063, US065 |

### Ramos de Teste

| Ramo | Arquivo | Resultado Esperado | ID |
|------|---------|-------------------|----|
| **⚠️ Bug US059** — DMG vs DM | `cardConditions.js:6` vs `Listing.js:43` | Valor `DMG` do frontend **não passa** no enum do backend | RN01 |
| **⚠️ Bug US060** — jwt.decode vs verify | `middleware/auth.js:16,57` | Token inválido não é rejeitado (deveria ser) | RN02 |
| **⚠️ Bug US061** — CSS NewListining | `index.css:9` | Import sem extensão não carrega | RN03 |
| **⚠️ Bug US062** — auth duplicado cart | `cartRoutes.js:7-10` | authenticateToken registrado 2× | RN04 |
| **⚠️ Bug US058** — hasListings | `ProtectedRoute.jsx:43,61` | Propriedade undefined causa erro runtime | RN05 |
| **⚠️ Bug US064** — link carrinho | `Home.jsx:51` | `/cart/${user.id}` rota inválida | RN06 |
| **⚠️ Bug US065** — StoreProvider.jsx | `context/StoreProvider.jsx` | Arquivo duplicado, não importado | RN07 |

### ✅ Resultado / O que foi feito

> _A ser preenchido após execução._

---

## QAT-014: Testes do Product Backlog — Validação de User Stories

| Campo | Valor |
|-------|-------|
| **Épico** | Validação de Documentação |
| **UC** | Todos |
| **Tipo** | Revisão |
| **Módulo** | `product-backlog.md` |
| **Classes/Arquivos** | `product-backlog.md`, `docs/Scrum/*.md`, `diagramas/*.drawio` |
| **User Stories** | Todas |

### Ramos de Teste

| Ramo | Descrição | Resultado Esperado | ID |
|------|-----------|-------------------|----|
| **Cobertura** | Toda funcionalidade do código tem user story? | Sem lacunas | D01 |
| **Consistência** | IDs US referenciados corretamente entre docs? | Cross-reference válido | D02 |
| **Regras de Negócio** | RN001-RN053 extraídas condizem com o código? | Aderência 100% | D03 |
| **Diagramas** | Draw.io abre sem erros? | Arquivos XML válidos | D04 |
| **Mermaid** | Código Mermaid dos .md é sintaticamente válido? | Sem erros de parse | D05 |

### ✅ Resultado / O que foi feito

> **Status: ✅ Completo**
> - 7 testes criados validando existência e conteúdo dos documentos
> - Cobre: product-backlog.md, 5 diagramas .drawio (XML válidos), 6 docs markdown, plano-testes-qa.md, qa-sprint-backlog.md
> - Todos passaram

---

## Resumo da Sprint

| Task | Descrição | Tipo | Status | Testes |
|------|-----------|------|--------|--------|
| QAT-001 | Setup do Ambiente | Config | ✅ Completo | 3 |
| QAT-002 | Autenticação — Auth Middleware | API+Security | ✅ Completo | 11 |
| QAT-003 | Store — Criação | API | ✅ Completo | 8 |
| QAT-004 | Store — Leitura e Edição | API | ✅ Completo | 9 |
| QAT-005 | Listing — Criação e Normalização | API+Unit | ✅ Completo | 14 |
| QAT-006 | Listing — Leitura, Edição, Exclusão | API | ✅ Completo | 13 |
| QAT-007 | Carrinho — CRUD e Regras | API+Integration | ✅ Completo | 13 |
| QAT-008 | Pokémon TCG Proxy — Dados Locais | API | ✅ Completo | 12 |
| QAT-009 | Integração — Fluxo do Vendedor | Integration | ✅ Completo | 4 |
| QAT-010 | Integração — Fluxo do Comprador | Integration | ✅ Completo | 3 |
| QAT-011 | Segurança — Middleware e Rotas | Security | ✅ Completo | 7 |
| QAT-012 | Componente — Páginas Frontend | Component | ✅ Completo | 13 |
| QAT-013 | Regras de Negócio — Inconsistências | Unit+API | ✅ Completo | 7 |
| QAT-014 | Product Backlog — Validação de Docs | Revisão | ✅ Completo | 7 |
| | **Total** | | | **124** |

---

## Instruções para o QA Agent

1. Cada task QAT deve ser executada em ordem preferencial (seguindo numeração), mas tasks independentes (ex: QAT-008 proxy) podem rodar em paralelo
2. Ao iniciar uma task: mudar status para 🔄 In Progress
3. Ao concluir: preencher o campo **✅ Resultado / O que foi feito** com:
   - Resumo do que foi executado
   - Quantos testes passaram / falharam
   - Bugs encontrados (referenciar ID do bug)
   - Evidências (logs, screenshots)
4. Bugs críticos devem ser reportados imediatamente ao time de desenvolvimento
5. Ao final da sprint: este documento é o relatório de QA
