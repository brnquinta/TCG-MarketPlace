# Product Backlog — TCG Marketplace

> **Fonte de Verdade Absoluta do Produto**
> Documento conceitual e técnico extraído retrospectivamente do código-fonte.
> Versão: 1.0 | Data: 29/05/2026

---

## 1. Project Charter

### 1.1 Visão do Produto
Marketplace brasileiro especializado em cartas **Pokémon TCG**, conectando compradores e vendedores com segurança, suporte a certificação (PSA/CGC/BGS), carrinho multi-loja e preços de referência em reais (BRL).

### 1.2 Objetivos
- Facilitar a compra e venda de cartas Pokémon no Brasil
- Garantir segurança com autenticação via Clerk e retenção de pagamento (futuro)
- Oferecer catálogo de cartas com preços de referência internacionais convertidos para BRL
- Permitir que cada usuário tenha **uma loja** com anúncios próprios
- Agregar anúncios de diferentes lojas em um **carrinho unificado**

### 1.3 Público-Alvo
- Colecionadores brasileiros de Pokémon TCG
- Vendedores especializados (lojas físicas e online)
- Investidores em cartas raras e certificadas
- Jogadores competitivos (TCG Pocket / presencial)

### 1.4 Monetização (prevista)
- Taxa por venda concluída (não implementada)
- Anúncios destacados (não implementado)

### 1.5 Diferenciais
- Carrinho multi-loja (compra de vários vendedores em um só checkout)
- Preços de referência Cardmarket/TCGPlayer convertidos para BRL
- Certificação PSA, CGC, BGS integrada aos anúncios
- Foco exclusivo em Pokémon TCG
- Interface em português com estados brasileiros

---

## 2. Glossário do Domínio

| Termo | Definição |
|-------|-----------|
| **Anúncio (Listing)** | Oferta de venda de uma carta específica por um vendedor |
| **Carta (Card)** | CardSnapshot — dados imutáveis da carta do Pokémon TCG API |
| **Certificação** | Avaliação profissional da condição da carta (PSA, CGC, BGS) |
| **Condição** | Estado físico da carta: NM, LP, MP, HP, DM |
| **Carrinho** | Lista de itens do comprador, agrupados por loja vendedora |
| **Loja (Store)** | Perfil de vendedor com anúncios, avaliações e localização |
| **Onboarding** | Processo de ativação da loja (dados fiscais e bancários) |
| **Pedido (Order)** | Compra finalizada com itens, frete, pagamento e status |
| **Slug** | Identificador único da loja na URL (ex: `/store/loja-do-bruno`) |
| **Snapshot** | Cópia dos dados da carta no momento da criação do anúncio |

### 2.1 Condições das Cartas

| Código | Frontend | Backend | Significado |
|--------|----------|---------|-------------|
| NM | NM | NM | Perto de Nova (Near Mint) |
| LP | LP | LP | Levemente Jogada (Lightly Played) |
| MP | MP | MP | Moderadamente Jogada |
| HP | HP | HP | Muito Jogada (Heavily Played) |
| DMG | DMG | **DM** | Danificada (Damaged) — ⚠️ INCONSISTÊNCIA |

> **⚠️ Regra de Negócio:** Frontend envia `DMG`, backend espera `DM`. O controller não normaliza esse campo. **Necessita correção.**

### 2.2 Idiomas das Cartas

| Frontend (form) | Backend (modelo) | Label |
|-----------------|------------------|-------|
| PT-BR | PT-BR | Português |
| EN | EN | Inglês |
| JP | JP | Japonês |
| portugues → PT-BR | (normalizado) | — |
| ingles → EN | (normalizado) | — |

### 2.3 Estados do Anúncio

`draft` → `active` → `sold` | `inactive` | `removed`

### 2.4 Estados da Loja

`draft` → `active` | `inactive` | `suspended`

### 2.5 Onboarding da Loja

`pending` → `in_progress` → `approved` | `rejected`

### 2.6 Estados do Pedido

`pending` → `paid` → `processing` → `shipped` → `delivered`
`pending` → `cancelled` | `paid` → `refunded`

### 2.7 Empresas de Certificação

PSA, BGS, CGC, OTHER

---

## 3. Arquitetura do Sistema

### 3.1 Stack Tecnológica

```
Frontend (React 19 + Vite 8 + Tailwind 4)
    ↕ HTTP (fetch)
Backend (Express 4 + Mongoose 8)
    ↕ MongoDB
    ↕ Clerk Auth
    ↕ AwesomeAPI (USD→BRL)
    ↕ Pokémon TCG API (dados locais JSON)
```

### 3.2 Estrutura de Pastas

```
TCG-MarketPlace/
├── frontend/
│   ├── src/
│   │   ├── main.jsx              ← Entry point (Clerk + Router + Providers)
│   │   ├── App.jsx               ← Rotas (11 páginas)
│   │   ├── index.css             ← Tailwind + CSS blocks
│   │   ├── context/              ← StoreContext, CartContext, UserContext
│   │   ├── hooks/                ← useCardSearch, useApiStore, useStore
│   │   ├── services/             ← api.js (fetch wrapper), pokemonTcg.js (axios)
│   │   ├── pages/                ← 12 páginas
│   │   ├── layouts/              ← MainLayout
│   │   ├── components/           ← ProtectedRoute
│   │   └── blocks/               ← CSS BEM (14 arquivos)
│   ├── utils/                    ← cardConditions, cardLanguages, brazilianStates
│   └── public/
├── backend/
│   ├── src/
│   │   ├── app.js               ← Server Express (porta 3001)
│   │   ├── config/db.js          ← Conexão MongoDB
│   │   ├── middleware/auth.js    ← JWT decode (⚠️ sem verify)
│   │   ├── models/               ← User, Store, Listing, Cart, Order
│   │   ├── controllers/          ← auth, store, listing, cart, webhook
│   │   ├── routes/               ← 7 arquivos de rotas
│   │   └── data/                 ← cards.json, sets.json, rarities.json
│   └── scripts/
└── docs/Scrum/
```

### 3.3 Fluxo de Dados

```
Usuário → Browser → React SPA → fetch (Bearer JWT Clerk) → Express API
    → Mongoose → MongoDB
    → Pokémon TCG Proxy (JSON local)
    → AwesomeAPI (cotação USD/BRL)
```

---

## 4. Mapa de Rotas da API

### 4.1 Auth

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/auth/sync` | — | Sincronizar usuário Clerk → MongoDB |
| GET | `/api/auth/user/:clerkId` | — | Buscar usuário por Clerk ID |
| GET | `/api/auth/me` | JWT | Usuário logado atual |

### 4.2 Stores

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/stores` | JWT | Criar loja |
| GET | `/api/stores/me` | JWT | Minha loja |
| PUT | `/api/stores/me` | JWT | Atualizar minha loja |
| GET | `/api/stores/slug/:slug` | Opt | Loja pública por slug |
| GET | `/api/stores` | Opt | Listar lojas ativas |

### 4.3 Listings

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/listings` | JWT | Criar anúncio |
| GET | `/api/listings/my` | JWT | Meus anúncios |
| PUT | `/api/listings/:id` | JWT | Atualizar anúncio |
| DELETE | `/api/listings/:id` | JWT | Deletar anúncio |
| GET | `/api/listings/:id` | Opt | Anúncio por ID |
| GET | `/api/listings` | Opt | Anúncios públicos (filtros) |

### 4.4 Cart

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/cart` | JWT | Meu carrinho |
| POST | `/api/cart/items` | JWT | Adicionar item |
| DELETE | `/api/cart/items/:listingId` | JWT | Remover item |
| DELETE | `/api/cart` | JWT | Limpar carrinho |

### 4.5 Pokemon TCG Proxy (dados locais)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/cards` | Buscar cartas (filtros: name, number, set, rarity) |
| GET | `/api/cards/:id` | Carta por ID |
| GET | `/api/sets` | Listar sets |
| GET | `/api/rarities` | Listar raridades |

### 4.6 Webhooks / Debug

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/webhooks/clerk` | Webhook Clerk (user.created/updated/deleted) |
| POST | `/api/debug/create-user` | Criar usuário de teste |
| POST | `/api/debug/create-store` | Criar loja de teste |
| POST | `/api/debug/create-listing` | Criar anúncio de teste |

---

## 5. Modelo de Dados (MongoDB)

### 5.1 User

```javascript
{
  clerkId:        String    // único, indexado
  email:          String    // único, obrigatório
  firstName:      String
  lastName:       String
  imageUrl:       String
  createdAt:      Date
  updatedAt:      Date      // auto no pre('save')
}
```

### 5.2 Store

```javascript
{
  userId:          ObjectId → User  // 1:1 (um usuário = uma loja)
  name:            String    // obrigatório
  slug:            String    // único, lowercase, obrigatório
  logoUrl:         String
  bannerUrl:       String
  description:     String
  location:        { city: String, state: String }
  status:          enum[draft, active, inactive, suspended]
  onboardingStatus: enum[pending, in_progress, approved, rejected]
  rating:          { average: Number, reviewsCount: Number }
  stats:           { activeListings, totalSales, totalViews }
  contact:         { phone, email }
  paymentInfo:     { cpf, cnpj, bankAccount, pixKey }
}
```

### 5.3 Listing

```javascript
{
  storeId:      ObjectId → Store     // 1:N
  userId:       ObjectId → User      // 1:N
  cardSnapshot: {
    cardId, name, number, rarity, supertype,
    subtypes[], imageSmall, imageLarge,
    setId, setName, setSeries, setReleaseDate
  }
  listingData: {
    language:         enum[PT-BR, EN, JP, ES, FR, DE, IT, KO, ZH]
    condition:        enum[NM, LP, MP, HP, DM]  // ⚠️ DM != DMG
    price:            Number (min: 0)
    quantity:         Number (min: 1, default: 1)
    certified:        Boolean
    gradingCompany:   enum[PSA, BGS, CGC, OTHER, null]
    grade:            String
    acceptsOffer:     Boolean
    description:      String
    defects:          String
    shippingAvailable: Boolean (default: true)
    localPickup:      Boolean
    city, state:      String
  }
  photos:       { front90, back90, front45, back45 }
  status:       enum[draft, active, sold, inactive, removed]
  views:        Number
  soldAt:       Date
}
```

### 5.4 Cart (embedded items)

```javascript
{
  userId: ObjectId → User  // único (1:1)
  items: [{
    listingId: ObjectId → Listing
    price:     Number
    addedAt:   Date
  }]
}
```

### 5.5 Order

```javascript
{
  orderNumber: String    // único, formato ORDYYYYMM######
  buyerId:     ObjectId → User
  sellerId:    ObjectId → User
  items: [{
    listingId, cardName, cardImage, price, quantity
  }]
  total:       Number
  status:      enum[pending, paid, processing, shipped, delivered, cancelled, refunded]
  shipping:    { address: { street, city, state, zipCode, country }, method, trackingCode, ... }
  payment:     { method, provider, providerOrderId, paidAt, transactionId }
  notes:       String
}
```

### 5.6 Relacionamentos

| De | Para | Tipo | Regra |
|----|------|------|-------|
| User | Store | **1:1** | Um usuário = uma loja |
| User | Listing | **1:N** | Um usuário tem N anúncios |
| User | Order | **1:N** | Um usuário compra N pedidos |
| User | Order (seller) | **1:N** | Um usuário vende N pedidos |
| User | Cart | **1:1** | Um usuário tem um carrinho |
| Store | Listing | **1:N** | Uma loja tem N anúncios |
| Listing | Order items | **N:N** | Anúncios aparecem em pedidos |

---

## 6. Regras de Negócio (Extraídas do Código)

### 6.1 Autenticação e Usuário

- RN001: Usuário é autenticado exclusivamente via Clerk (JWT)
- RN002: `authenticateToken` decodifica o JWT e cria usuário automaticamente se não existir (auto-registro)
- RN003: `optionalAuth` decodifica o JWT se presente, mas não falha se ausente
- RN004: ⚠️ `jwt.decode()` é usado em vez de `jwt.verify()` — **token não é verificado**
- RN005: Clerk deve estar configurado com webhook para capturar criação/atualização/deleção de usuário

### 6.2 Loja

- RN006: Um usuário pode ter **no máximo 1 loja**
- RN007: Slug deve ser único, lowercase, gerado automaticamente a partir do nome
- RN008: Slug pode ser editado manualmente (após edição, não é mais auto-gerado)
- RN009: Loja criada com status `draft` e onboarding `pending`
- RN010: Loja inativa (`inactive`) ou `suspended` não aparece na listagem pública
- RN011: Apenas lojas com status `active` são retornadas em `getStoreBySlug`
- RN012: Ao criar anúncio, `store.stats.activeListings` é incrementado
- RN013: Ao deletar anúncio, `store.stats.activeListings` é decrementado
- RN014: Visualizar loja pública incrementa `store.stats.totalViews`

### 6.3 Anúncio

- RN015: `cardSnapshot` + `listingData` são obrigatórios para criar anúncio
- RN016: Anúncio é criado com status `active` automaticamente
- RN017: Preço mínimo é 0 (sem validação de preço > 0)
- RN018: Quantidade mínima é 1
- RN019: ⚠️ Código frontend envia `DMG` como condição, backend espera `DM` — incompatível
- RN020: **4 fotos obrigatórias**: front90, back90, front45, back45
- RN021: Fotos devem ser tiradas sobre mesa escura, com luz sobre o produto
- RN022: Certificação é opcional — se `certified=true`, gradingCompany e grade podem ser preenchidos
- RN023: Idioma é normalizado pelo backend (portugues→PT-BR, english→EN, etc.)
- RN024: Ao visualizar anúncio, `listing.views` é incrementado
- RN025: Apenas anúncios `active` aparecem na busca pública
- RN026: Vendedor pode atualizar cardSnapshot parcialmente (merge) e listingData completamente (normalizado)
- RN027: Filtros públicos: price (min/max), condition, certified, setName, language, search (nome/set)
- RN028: Anúncios públicos ordenados por `createdAt` descendente
- RN029: Paginação pública: page=1, limit=20 (default)

### 6.4 Carrinho

- RN030: Usuário precisa estar autenticado para ter carrinho
- RN031: Carrinho é único por usuário (1:1)
- RN032: Apenas anúncios `active` podem ser adicionados ao carrinho
- RN033: Apenas anúncios com `quantity >= 1` podem ser adicionados
- RN034: Item duplicado não pode ser adicionado — retorna erro "Item já está no carrinho"
- RN035: Carrinho retorna items populados com dados do Listing e Store
- RN036: Carrinho vazio retorna `{ items: [], total: 0 }`

### 6.5 Pedido (Modelo definido, sem implementação)

- RN037: Número do pedido gerado automaticamente: `ORD` + YYYYMM + 6 dígitos sequenciais
- RN038: Pedido pertence a um buyer e um seller
- RN039: Pedido pode conter múltiplos itens
- RN040: Status segue fluxo: pending → paid → processing → shipped → delivered

### 6.6 Catálogo de Cartas (Proxy Local)

- RN041: Dados de cartas servidos de arquivos JSON locais (sem chamada externa em runtime)
- RN042: Apenas **5 coleções** disponíveis: Paldean Fates, 151, Crown Zenith, Evolving Skies, Base Set
- RN043: Cotação USD→BRL buscada da AwesomeAPI (tempo real, cache global)
- RN044: Fallback da cotação: 5.8 (se AwesomeAPI falhar)
- RN045: Filtros aceitos: name (contains), number (exato), set.name (exato), rarity (exato)

### 6.7 Proteção de Rotas (Componentes)

- RN046: `RequireAuth` — redireciona para `/` se não autenticado
- RN047: `RequireStore` — redireciona para `/store/create` se não tem loja
- RN048: ⚠️ `RequireListing` — refere `hasListings` que **não existe** no StoreContext (quebrado)
- RN049: `ProtectedDashboard` — se não tem loja, redireciona para `/store/create`
- RN050: ⚠️ `StoreOrListingRedirect` — refere `hasListings` que não existe (quebrado)

### 6.8 Validações de Imagem (Store Edit)

- RN051: Banner mínimo: 800×200px
- RN052: Logo mínimo: 100×100px (quadrada)
- RN053: Upload via file input com preview ObjectURL (não persiste no backend)

---

## 7. Épicos e User Stories

### 7.1 Legenda

- **ID**: `US` + número sequencial
- **Prioridade**: Must (M), Should (S), Could (C), Won't (W)
- **Story Points**: 1 (XS), 2 (S), 3 (M), 5 (L), 8 (XL), 13 (XXL)
- **Status**: ✅ Implementado | 🔧 Parcial | ❌ Não iniciado | 🐛 Bug

---

### Épico 1 — Autenticação e Usuário

| ID | História | Prioridade | SP | Status |
|----|----------|-----------|----|--------|
| US001 | Como visitante, quero me cadastrar/login via Clerk para acessar funcionalidades exclusivas | M | 3 | ✅ |
| US002 | Como usuário, quero que minha conta seja sincronizada automaticamente ao backend para manter meus dados consistentes | M | 2 | ✅ |
| US003 | Como desenvolvedor, quero middleware de autenticação nas rotas protegidas para garantir segurança | M | 2 | ✅ |
| US004 | Como desenvolvedor, quero webhook Clerk para sincronizar criação/alteração/deleção de usuários | S | 3 | 🔧 |
| US005 | Como desenvolvedor, quero que o JWT seja verificado (verify) em vez de apenas decodificado (decode) | M | 1 | 🐛 |

### Épico 2 — Lojas

| ID | História | Prioridade | SP | Status |
|----|----------|-----------|----|--------|
| US006 | Como usuário logado, quero criar minha loja com nome, slug, logo e localização para começar a vender | M | 5 | ✅ |
| US007 | Como vendedor, quero que o slug seja gerado automaticamente a partir do nome para facilitar a criação | S | 1 | ✅ |
| US008 | Como vendedor, quero editar informações da minha loja (nome, slug, descrição, logo, banner, localização) | M | 3 | ✅ |
| US009 | Como vendedor, quero fazer upload de banner e logo com validação de tamanho mínimo | S | 3 | 🔧 |
| US010 | Como vendedor, quero ver o dashboard da minha loja com estatísticas (anúncios, vendas, visualizações) | M | 5 | ✅ |
| US011 | Como vendedor, quero completar o onboarding (dados fiscais e bancários) para ativar minha loja | M | 5 | ❌ |
| US012 | Como comprador, quero ver a página pública de uma loja com seus anúncios e avaliações | M | 5 | 🐛 |
| US013 | Como comprador, quero listar todas as lojas ativas para descobrir novos vendedores | S | 3 | ✅ |

### Épico 3 — Catálogo de Cartas

| ID | História | Prioridade | SP | Status |
|----|----------|-----------|----|--------|
| US014 | Como usuário, quero buscar cartas por nome, número, set e raridade | M | 5 | ✅ |
| US015 | Como usuário, quero ver detalhes da carta com imagem, set, número, raridade e artista | M | 3 | ✅ |
| US016 | Como usuário, quero ver preços de referência internacionais (Cardmarket, TCGPlayer) convertidos para BRL | M | 3 | ✅ |
| US017 | Como usuário, quero autocomplete no campo de set para encontrar rapidamente a coleção | S | 2 | ✅ |
| US018 | Como vendedor, quero buscar e selecionar uma carta do catálogo para criar um anúncio | M | 5 | ✅ |
| US019 | Como desenvolvedor, quero que os dados de cartas sejam servidos localmente (sem dependência externa em runtime) | M | 3 | ✅ |
| US020 | Como desenvolvedor, quero incluir mais coleções além das 5 atuais para ampliar o catálogo | C | 5 | ❌ |

### Épico 4 — Anúncios

| ID | História | Prioridade | SP | Status |
|----|----------|-----------|----|--------|
| US021 | Como vendedor, quero criar um anúncio com carta selecionada, preço, condição, idioma e fotos | M | 8 | ✅ |
| US022 | Como vendedor, quero tirar 4 fotos obrigatórias (frente/verso 90° e 45°) para garantir a qualidade do anúncio | M | 5 | ✅ |
| US023 | Como vendedor, quero indicar se a carta é certificada (PSA/CGC/BGS) com a nota | S | 2 | ✅ |
| US024 | Como vendedor, quero definir opções de entrega (envio disponível, retirada em mãos) | M | 2 | ✅ |
| US025 | Como vendedor, quero aceitar ou não ofertas no anúncio | S | 1 | ✅ |
| US026 | Como vendedor, quero editar e deletar meus anúncios | M | 3 | ✅ |
| US027 | Como comprador, quero ver anúncios públicos com filtros (preço, condição, certificada, idioma, set) | M | 5 | ✅ |
| US028 | Como comprador, quero ver detalhes do anúncio com fotos em carrossel, descrição e dados de entrega | M | 5 | ✅ |
| US029 | Como comprador, quero alternar entre visualização grid e lista na página de anúncios | S | 1 | ✅ |

### Épico 5 — Carrinho

| ID | História | Prioridade | SP | Status |
|----|----------|-----------|----|--------|
| US030 | Como comprador logado, quero adicionar itens ao carrinho para comprar depois | M | 3 | ✅ |
| US031 | Como comprador, quero ver meu carrinho agrupado por loja vendedora | M | 3 | ✅ |
| US032 | Como comprador, quero remover itens do carrinho | M | 2 | ✅ |
| US033 | Como comprador, quero ver o resumo do pedido com subtotal por loja e total geral | M | 3 | ✅ |
| US034 | Como comprador, quero que o carrinho persista no backend para não perder itens entre sessões | M | 3 | ✅ |
| US035 | Como comprador, quero ver impedimentos (item inativo, sem estoque) ao adicionar ao carrinho | M | 2 | ✅ |

### Épico 6 — Checkout e Pedidos

| ID | História | Prioridade | SP | Status |
|----|----------|-----------|----|--------|
| US036 | Como comprador, quero finalizar a compra dos itens do carrinho | M | 13 | ❌ |
| US037 | Como comprador, quero informar endereço de entrega no checkout | M | 5 | ❌ |
| US038 | Como comprador, quero escolher método de frete | M | 5 | ❌ |
| US039 | Como comprador, quero ver o resumo completo do pedido antes de confirmar | M | 5 | ❌ |
| US040 | Como comprador, quero receber confirmação do pedido com número de protocolo | M | 3 | ❌ |
| US041 | Como vendedor, quero ver pedidos recebidos na minha loja | M | 5 | ❌ |
| US042 | Como vendedor, quero atualizar status do pedido (processando, enviado, entregue) | M | 5 | ❌ |
| US043 | Como comprador, quero consultar meus pedidos com status atual | S | 3 | ❌ |
| US044 | Como comprador, quero cancelar um pedido (se aplicável) | S | 3 | ❌ |
| US045 | Como sistema, quero gerar número de pedido único no formato ORDYYYYMM###### | M | 2 | ❌ |

### Épico 7 — Pagamentos

| ID | História | Prioridade | SP | Status |
|----|----------|-----------|----|--------|
| US046 | Como comprador, quero pagar via PIX | M | 8 | ❌ |
| US047 | Como comprador, quero pagar via cartão de crédito | S | 8 | ❌ |
| US048 | Como comprador, quero que o dinheiro fique retido até eu confirmar recebimento | M | 5 | ❌ |
| US049 | Como vendedor, quero receber notificação de venda paga | S | 3 | ❌ |
| US050 | Como vendedor, quero configurar chave PIX e conta bancária na minha loja | M | 3 | ❌ |

### Épico 8 — Reviews e Reputação

| ID | História | Prioridade | SP | Status |
|----|----------|-----------|----|--------|
| US051 | Como comprador, quero avaliar o vendedor após a compra | S | 5 | ❌ |
| US052 | Como comprador, quero ver avaliações de uma loja antes de comprar | S | 3 | ❌ |
| US053 | Como vendedor, quero ver minha reputação no dashboard | S | 2 | ❌ |
| US054 | Como sistema, quero calcular média de avaliações da loja automaticamente | S | 3 | ❌ |

### Épico 9 — Pagamento e Entrega

| ID | História | Prioridade | SP | Status |
|----|----------|-----------|----|--------|
| US055 | Como comprador, quero calcular frete para minha localização | S | 5 | ❌ |
| US056 | Como vendedor, quero informar código de rastreio do pedido | S | 2 | ❌ |
| US057 | Como comprador, quero receber notificação de atualização de status do pedido | C | 5 | ❌ |

### Épico 10 — Qualidade e Correções

| ID | História | Prioridade | SP | Status |
|----|----------|-----------|----|--------|
| US058 | Como desenvolvedor, quero corrigir `hasListings` no StoreContext para os componentes ProtectedRoute funcionarem | M | 1 | 🐛 |
| US059 | Como desenvolvedor, quero alinhar condição `DMG` (frontend) com `DM` (backend) | M | 1 | 🐛 |
| US060 | Como desenvolvedor, quero usar `jwt.verify()` em vez de `jwt.decode()` para segurança do JWT | M | 2 | 🐛 |
| US061 | Como desenvolvedor, quero corrigir o CSS import `NewListining` para `NewListing.css` | M | 1 | 🐛 |
| US062 | Como desenvolvedor, quero remover duplicação de middleware `authenticateToken` no cartRoutes | S | 1 | 🐛 |
| US063 | Como desenvolvedor, quero limpar ~88 console.log do código de produção | S | 3 | 🐛 |
| US064 | Como desenvolvedor, quero corrigir link do carrinho na Home (`/cart/${user.id}` → `/cart`) | M | 1 | 🐛 |
| US065 | Como desenvolvedor, quero remover o arquivo órfão `context/StoreProvider.jsx` (duplicata de `pages/CreateStore.jsx`) | S | 1 | 🐛 |
| US066 | Como desenvolvedor, quero configurar as chaves Clerk no backend (placeholder → valores reais) | M | 1 | 🐛 |

---

## 8. Roadmap Consolidado

### Fase 1 — Fundação (✅ Completa)
Autenticação, criação de loja, dashboard, cadastro de cartas.

**Stories:** US001-US004, US006-US010, US013-US020

### Fase 2 — Anúncios e Carrinho (✅ Completa)
CRUD de anúncios, busca pública, fotos, carrinho multi-loja.

**Stories:** US021-US035

### Fase 3 — Checkout e Pedidos (❌ Não iniciada)
Finalização de compra, cálculo de frete, gestão de pedidos.

**Stories:** US036-US045

### Fase 4 — Pagamentos (❌ Não iniciada)
Integração PIX e cartão, retenção de pagamento, repasse ao vendedor.

**Stories:** US046-US050, US055-US057

### Fase 5 — Reviews e Qualidade (❌ Não iniciada)
Sistema de avaliações, reputação, testes, correções de bugs.

**Stories:** US051-US054, US058-US066

---

## 9. Dívidas Técnicas e Bugs Conhecidos

| ID | Descrição | Arquivo:Linha | Impacto |
|----|-----------|---------------|---------|
| BUG001 | `hasListings` não existe no StoreContext | `ProtectedRoute.jsx:43,61` | Componentes quebram em runtime |
| BUG002 | JWT sem verificação (decode vs verify) | `middleware/auth.js:16,57` | Segurança comprometida |
| BUG003 | Frontend `DMG` vs Backend `DM` | `cardConditions.js:6` vs `Listing.js:43` | Anúncio danificado falha |
| BUG004 | CSS import sem extensão `.css` | `index.css:9` | Bloco não carrega |
| BUG005 | Auth duplicado no cart | `cartRoutes.js:7-10` + `app.js:71` | Middleware executado 2× |
| BUG006 | Checkout page é stub | `Checkout.jsx:1` | Fluxo quebrado |
| BUG007 | Store page com dados mock | `Store.jsx:6-54` | Não conecta ao backend |
| BUG008 | Duplicata CreateStore | `context/StoreProvider.jsx` | Código redundante |
| BUG009 | Link do carrinho errado na Home | `Home.jsx:51` | Rota inválida |
| BUG010 | Título HTML "frontend" | `index.html:7` | SEO/identidade |

---

## 10. Métricas do Projeto

| Métrica | Valor |
|---------|-------|
| Arquivos de código | ~60 |
| Páginas frontend | 12 |
| Rotas de API | 20 |
| Modelos MongoDB | 5 |
| Testes | **0** |
| Console.log | ~88 |
| Bugs conhecidos | 10 |
| Funcionalidades implementadas | ~35 |
| Funcionalidades pendentes | ~31 |
| Coleções de cartas disponíveis | 5 |
| Cobertura de autenticação | ✅ |
| Cobertura de checkout | ❌ |
| Cobertura de pagamentos | ❌ |
| Cobertura de reviews | ❌ |
