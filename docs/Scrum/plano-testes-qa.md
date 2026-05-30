# Plano de Testes — TCG Marketplace

> Proposta de criação de suíte de testes automatizados
> Elaborado para análise e aprovação
> Versão: 1.0 | Data: 29/05/2026

---

## 1. Objetivo

Criar uma rotina de testes automatizados que cubra **todos os casos de uso** do TCG Marketplace, garantindo que as 35 funcionalidades implementadas estejam funcionando e que as 31 pendentes tenham esqueletos de teste prontos para quando forem desenvolvidas.

---

## 2. Escopo

### 2.1 O que será testado

| Camada | Cobertura | Casos de Uso |
|--------|-----------|--------------|
| **API (Backend)** | Unitaire+ Integração | UC01 a UC10 |
| **Componentes (Frontend)** | Renderização + Interação | UC01 a UC05, UC08 a UC10 |
| **Regras de Negócio** | Validações específicas | RN001 a RN053 |

### 2.2 O que NÃO será testado (nesta fase)

- Testes de performance/carga
- Testes de segurança avançados (penetration testing)
- Testes de acessibilidade
- Testes visuais (screenshot diff)

---

## 3. Estrutura de Pastas

```
backend/
├── tests/
│   ├── setup.js                     ← MongoDB mock + Clerk mock
│   ├── helpers/
│   │   ├── factories.js             ← Dados fictícios (user, store, listing)
│   │   └── authHelper.js            ← Geração de token JWT mock
│   ├── api/
│   │   ├── auth.test.js             ← US001-US005: sync, middleware, validação
│   │   ├── stores.test.js           ← US006-US013: CRUD, slug, permissões
│   │   ├── listings.test.js         ← US021-US029: CRUD, filtros, normalização
│   │   └── cart.test.js             ← US030-US035: add, remove, validações
│   ├── integration/
│   │   ├── fluxo-vendedor.test.js   ← Login → Loja → Anúncio → Listagem
│   │   └── fluxo-comprador.test.js  ← Busca → Carrinho → Checkout (futuro)
│   └── fixtures/
│       ├── cards.json
│       └── users.json

frontend/
├── tests/
│   ├── setup.js                     ← Vitest + React Testing Library
│   ├── components/
│   │   └── ProtectedRoute.test.jsx  ← RN046-RN050: redirecionamentos
│   ├── pages/
│   │   ├── Home.test.jsx
│   │   ├── Search.test.jsx
│   │   ├── NewListing.test.jsx
│   │   └── Cart.test.jsx
│   ├── hooks/
│   │   ├── useCardSearch.test.js    ← Cache, BRL format, autocomplete
│   │   └── useCart.test.js          ← Agrupamento, totais
│   └── services/
│       └── api.test.js              ← Wrapper fetch, JWT header
```

---

## 4. Ferramentas

| Ferramenta | Uso | Instalação |
|-----------|-----|-----------|
| **Vitest** | Runner de testes (unitaire+componente) | `npm install -D vitest` (frontend + backend) |
| **Supertest** | Testes de API HTTP | `npm install -D supertest` (backend) |
| **React Testing Library** | Testes de componente React | `npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event` (frontend) |
| **mongodb-memory-server** | Banco MongoDB em memória pra testes | `npm install -D mongodb-memory-server` (backend) |
| **sinon** | Mocks e stubs | `npm install -D sinon` (backend + frontend) |
| **nock** | Mock de chamadas HTTP externas | `npm install -D nock` (backend) |

---

## 5. Cenários de Teste por Caso de Uso

### UC01 — Buscar Cartas no Catálogo

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| T001 | Busca por nome exato | `name:Charizard` | Retorna cartas com "Charizard" |
| T002 | Busca por nome parcial | `name:Char` | Retorna cartas começando com "Char" |
| T003 | Busca por número | `number:4` | Retorna carta específica |
| T004 | Busca por set | `set.name:"Base Set"` | Retorna cartas do set |
| T005 | Busca por raridade | `rarity:"Rare Holo"` | Retorna cartas da raridade |
| T006 | Combinação de filtros | nome + número + set | Interseção dos filtros |
| T007 | Nenhum resultado | nome inexistente | `{ data: [], count: 0 }` |
| T008 | Paginação | page=2, pageSize=10 | Retorna página 2 com 10 itens |

### UC02 — Ver Detalhes da Carta

| ID | Cenário | Resultado Esperado |
|----|---------|-------------------|
| T009 | Carta existe | Retorna 200 com dados da carta |
| T010 | Carta não existe | Retorna 404 com mensagem de erro |

### UC03 — Listar Anúncios Públicos

| ID | Cenário | Resultado Esperado |
|----|---------|-------------------|
| T011 | Lista anúncios ativos | Retorna apenas listings `active` |
| T012 | Filtro por preço mínimo | Exclui abaixo do valor |
| T013 | Filtro por preço máximo | Exclui acima do valor |
| T014 | Filtro por condição | Apenas condição específica |
| T015 | Filtro por certificada | Apenas certified=true |
| T016 | Filtro por set | Regex case-insensitive |
| T017 | Busca textual (nome/set) | OR entre nome e set |
| T018 | Paginação | Default 20, page=1 |

### UC04 — Ver Detalhes do Anúncio

| ID | Cenário | Resultado Esperado |
|----|---------|-------------------|
| T019 | Anúncio existe | 200 com populate storeId |
| T020 | Anúncio não existe | 404 |
| T021 | Views incrementado | Verificar +1 a cada GET |

### UC05 — Gerenciar Carrinho

| ID | Cenário | Resultado Esperado |
|----|---------|-------------------|
| T022 | Add item sem token | 401 |
| T023 | Add item com listingId válido | 200, item no carrinho |
| T024 | Add item duplicado | 400 "Item já está no carrinho" |
| T025 | Add anúncio inativo | 400 |
| T026 | Add anúncio sem estoque | 400 |
| T027 | Remover item existente | 200 |
| T028 | Remover item inexistente | 404 |
| T029 | Limpar carrinho | 200, items vazio |

### UC06 — Finalizar Compra

| ID | Cenário | Resultado Esperado |
|----|---------|-------------------|
| T030 | Acessar /checkout | Stub — retorna `<div>` vazio |

### UC07 — Visualizar Loja

| ID | Cenário | Resultado Esperado |
|----|---------|-------------------|
| T031 | Loja por slug ativa | 200 com dados + populate user |
| T032 | Slug inexistente | 404 |
| T033 | Loja inativa | 404 (filtro `status: active`) |
| T034 | Loja suspensa | 404 |

### UC08 — Criar Loja

| ID | Cenário | Resultado Esperado |
|----|---------|-------------------|
| T035 | Criar sem token | 401 |
| T036 | Criar sem nome/slug | 400 |
| T037 | Criar com slug duplicado | 400 |
| T038 | Criar quando já tem loja | 400 |
| T039 | Criar com dados válidos | 201, status=draft |

### UC09 — Editar Loja

| ID | Cenário | Resultado Esperado |
|----|---------|-------------------|
| T040 | Editar sem token | 401 |
| T041 | Editar sem ter loja | 404 |
| T042 | Editar com dados parciais | Merge correto |
| T043 | Editar location parcial | Merge de city/state |

### UC10 — Criar Anúncio

| ID | Cenário | Resultado Esperado |
|----|---------|-------------------|
| T044 | Criar sem token | 401 |
| T045 | Criar sem loja | 404 |
| T046 | Criar sem cardSnapshot | 400 |
| T047 | Criar sem listingData | 400 |
| T048 | Criar com dados válidos | 201, status=active |
| T049 | Normalização de idioma | `portugues` → `PT-BR` |
| T050 | Normalização de preço | String → Number, fallback 0 |
| T051 | Normalização de quantidade | Mínimo 1 |
| T052 | Incremento de activeListings | +1 na store |

---

## 6. Regras de Negócio Testadas (RNs)

Prioridade de validação:

| RN | Descrição | Teste |
|----|-----------|-------|
| RN002 | Auto-criação de usuário | T053 |
| RN004 | ⚠️ jwt.decode vs verify | T054 (deve falhar com token inválido) |
| RN006 | 1 loja por usuário | T038 |
| RN011 | Apenas stores `active` | T033 |
| RN012 | Incremento activeListings | T052 |
| RN015 | cardSnapshot + listingData obrigatórios | T046-T047 |
| RN019 | ⚠️ DMG vs DM | T055 (deve falhar ou normalizar) |
| RN020 | 4 fotos obrigatórias | T056 |
| RN027 | Filtros públicos de listing | T012-T017 |
| RN032 | Apenas anúncios `active` no carrinho | T025 |
| RN033 | Apenas quantity ≥ 1 no carrinho | T026 |
| RN034 | Sem itens duplicados no carrinho | T024 |
| RN048 | ⚠️ hasListings não existe | T057 (teste de componente) |

---

## 7. Instalação e Configuração

### Backend

```bash
cd backend
npm install -D vitest supertest mongodb-memory-server sinon nock
```

`package.json` — adicionar script:
```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

### Frontend

```bash
cd frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jsdom sinon
```

`vite.config.js` — adicionar config de teste:
```js
/// <reference types="vitest" />
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js',
  }
})
```

---

## 8. Entregáveis

| Item | Descrição | Esforço Estimado |
|------|-----------|-----------------|
| 1 | `plano-testes-qa.md` (este documento) | ✅ Pronto |
| 2 | Configuração Vitest + dependências | 1h |
| 3 | `tests/setup.js` (backend) | 1h |
| 4 | `tests/helpers/factories.js` | 1h |
| 5 | `tests/helpers/authHelper.js` | 30min |
| 6 | `tests/api/auth.test.js` | 2h |
| 7 | `tests/api/stores.test.js` | 2h |
| 8 | `tests/api/listings.test.js` | 3h |
| 9 | `tests/api/cart.test.js` | 2h |
| 10 | `tests/integration/fluxo-vendedor.test.js` | 2h |
| 11 | `tests/integration/fluxo-comprador.test.js` | 2h |
| 12 | Configuração Vitest frontend | 1h |
| 13 | `tests/pages/*.test.jsx` (5 páginas) | 4h |
| 14 | `tests/hooks/*.test.js` (2 hooks) | 2h |
| **Total** | | **~23h** |

---

## 9. Riscos e Observações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| `mongodb-memory-server` requer build tools | Instalação lenta | Fallback: banco de teste dedicado |
| Clerk JWT real precisa de chave real | Testes de auth travam | AuthHelper gera tokens mock com `jsonwebtoken` |
| Testes de frontend com Clerk mock | Complexidade | Mock do ClerkProvider com contexto fake |
| Dados JSON locais (cards.json) | Testes de busca dependem dos 5 sets | Fixture separada para testes |

---

## 10. Aprovação

Este documento é uma proposta. Após análise e aprovação, o agente de QA será acionado para implementar os entregáveis 2 a 14.
