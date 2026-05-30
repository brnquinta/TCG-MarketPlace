# 06 — Arquitetura do Sistema

## Diagrama de Arquitetura

```mermaid
graph TB
    subgraph "Camada 1: Cliente (Browser)"
        REACT["React SPA (Vite)
               Porta 5173"]
        COMP["Componentes
              12 Páginas
              3 Contexts
              3 Hooks"]
        SERVICES["Services
                  api.js (fetch)
                  pokemonTcg.js (axios)"]
        CLERK_FRONT["Clerk Auth
                     SignIn/SignUp
                     JWT Session Token"]
    end

    subgraph "Camada 2: Servidor (Node.js)"
        EXPRESS["Express 4
                 Porta 3001
                 Helmet + CORS + Morgan"]
        AUTH_MID["Auth Middleware
                  authenticateToken
                  optionalAuth
                  ⚠️ jwt.decode()"]
        ROUTES["Routes + Controllers
                7 rotas | 5 controllers
                20 endpoints REST"]
        MODELS["Mongoose Models
                User ✅ Store ✅
                Listing ✅ Cart ✅
                Order ❌"]
    end

    subgraph "Camada 3: Dados e APIs Externas"
        MONGO[(MongoDB)]
        TCG_DATA[("Pokémon TCG Data
                   JSON local
                   5 coleções")]
        AWESOME["AwesomeAPI
                 USD → BRL
                 Cotação tempo real"]
        CLERK_BACK["Clerk API
                    Webhooks
                    JWT tokens"]
    end

    REACT -->|fetch / Bearer JWT| EXPRESS
    CLERK_FRONT -->|Session Token| REACT
    EXPRESS --> AUTH_MID
    AUTH_MID --> ROUTES
    ROUTES --> MODELS
    MODELS -->|Mongoose| MONGO
    ROUTES -->|JSON| TCG_DATA
    ROUTES -->|Axios| AWESOME
    ROUTES -->|Webhook| CLERK_BACK
    COMP --> REACT
    SERVICES --> REACT
    CLERK_FRONT --> CLERK_BACK
```

## Fluxo de Requisição Típico

```mermaid
sequenceDiagram
    actor U as Usuário
    participant REACT as React SPA
    participant CLERK as Clerk
    participant EXPRESS as Express API
    participant MONGO as MongoDB
    participant TCG as TCG Proxy

    U->>REACT: Acessa página
    REACT->>CLERK: Verifica sessão
    CLERK-->>REACT: JWT Token

    U->>REACT: Clica "Criar Anúncio"
    REACT->>TCG: GET /api/cards?q=name:Charizard
    TCG-->>REACT: Lista de cartas
    U->>REACT: Seleciona carta + preenche dados
    REACT->>EXPRESS: POST /api/listings (Bearer JWT)
    EXPRESS->>MONGO: Listing.create()
    MONGO-->>EXPRESS: Listing salvo
    EXPRESS->>MONGO: Store.stats.activeListings++
    EXPRESS-->>REACT: 201 Created
    REACT-->>U: Redireciona ao anúncio
```

## Fluxo de Carrinho

```mermaid
sequenceDiagram
    actor U as Comprador
    participant REACT as React SPA
    participant API as Express API
    participant MONGO as MongoDB

    U->>REACT: Ver anúncio
    U->>REACT: Clica "Adicionar ao Carrinho"
    REACT->>API: POST /api/cart/items
    API->>MONGO: Verifica listing (active + estoque)
    API->>MONGO: Cart.findOne({userId})
    API->>MONGO: Verifica duplicata
    API->>MONGO: Cart.items.push()
    MONGO-->>API: Cart atualizado
    API-->>REACT: Cart populado
    REACT-->>U: Carrinho atualizado

    U->>REACT: Acessa /cart
    REACT->>API: GET /api/cart
    API->>MONGO: Cart.find().populate()
    MONGO-->>API: Cart com items + lojas
    API-->>REACT: {items, total}
    REACT-->>U: Carrinho agrupado por loja
```

## Mapa de Dependências entre Camadas

| Camada | Depende de | Tipo |
|--------|-----------|------|
| React SPA | Clerk React | Biblioteca |
| React SPA | Express API | HTTP (fetch) |
| React SPA | Pokémon TCG Proxy | HTTP (axios) |
| React SPA | AwesomeAPI | HTTP (axios) |
| Express API | MongoDB | Mongoose ODM |
| Express API | Clerk JWT | jsonwebtoken |
| Express API | Pokémon TCG Data | JSON file |
| Express API | AwesomeAPI | HTTP (axios) |

## Segurança

- ✅ Autenticação via Clerk (JWT externo)
- ✅ CORS configurado para localhost:5173
- ✅ Helmet (headers de segurança)
- ⚠️ `jwt.decode()` em vez de `jwt.verify()` — **não verifica assinatura do token**
- ⚠️ Chave secreta do Clerk no backend é placeholder

## Performance

- ✅ Dados de cartas em JSON local (sem latência externa)
- ✅ Cache global em memória para sets, raridades e cotação USD
- ✅ Paginação na API pública (default 20 itens)
