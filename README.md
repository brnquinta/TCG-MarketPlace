# TCG Marketplace

Marketplace completo para compra e venda de cartas colecionaveis (Trading Card Games). Plataforma fullstack construida com React, Express e MongoDB.

## Funcionalidades

- Autenticacao via Clerk (login/registro social)
- Criacao e gerenciamento de lojas pessoais
- Cadastro de anuncios com fotos e detalhes das cartas
- Busca avancada com filtros (nome, conjunto, raridade, numero)
- Carrinho de compras
- Integracao com API do Pokemon TCG
- Integracao com Mercado Pago (pagamentos)
- Integracao com Melhor Envio (frete)

## Arquitetura

```
TCG-MarketPlace/
├── backend/          # API REST com Express + MongoDB
│   ├── src/
│   │   ├── config/       # Configuracao do banco de dados
│   │   ├── controllers/  # Logica de negocio
│   │   ├── data/         # Dados estaticos (cartas, conjuntos, raridades)
│   │   ├── middleware/    # Autenticacao Clerk
│   │   ├── models/       # Schemas Mongoose
│   │   └── routes/       # Rotas da API
│   └── scripts/          # Scripts utilitarios
├── frontend/         # Aplicacao React com Vite
│   ├── src/
│   │   ├── blocks/       # Componentes de pagina (CSS + JSX)
│   │   ├── components/   componentes reutilizaveis
│   │   ├── context/      # React Context (Store, Cart, User)
│   │   ├── hooks/        # Custom hooks
│   │   ├── layouts/      # Layouts de pagina
│   │   ├── pages/        # Paginas da aplicacao
│   │   └── services/     # Camada de API
│   └── utils/            # Utilitarios (estados, condicoes, idiomas)
└── docs/             # Documentacao do projeto (Scrum, diagramas)
```

## Pre-requisitos

- Node.js 18+
- MongoDB local ou Atlas
- Conta no Clerk (autenticacao)
- Conta no Mercado Pago (sandbox para testes)

## Instalacao

### 1. Clone o repositorio

```bash
git clone https://github.com/seu-usuario/TCG-MarketPlace.git
cd TCG-MarketPlace
```

### 2. Configuracao do Backend

```bash
cd backend
cp .env.example .env   # Configure suas variaveis de ambiente
npm install
npm run dev
```

### 3. Configuracao do Frontend

```bash
cd frontend
cp .env.example .env   # Configure suas variaveis de ambiente
npm install
npm run dev
```

A aplicacao estara disponivel em `http://localhost:5173`.

## Variaveis de Ambiente

### Backend (backend/.env)

| Variavel | Descricao | Obrigatorio |
|----------|-----------|-------------|
| `PORT` | Porta do servidor (default: 3001) | Nao |
| `MONGODB_URI` | URI de conexao com MongoDB | Sim |
| `NODE_ENV` | Ambiente (development/production) | Nao |
| `CLERK_SECRET_KEY` | Chave secreta do Clerk | Sim |
| `CLERK_WEBHOOK_SECRET` | Secret para webhooks do Clerk | Nao |
| `MP_ACCESS_TOKEN` | Token de acesso Mercado Pago | Sim (pagamentos) |
| `MP_PUBLIC_KEY` | Chave publica Mercado Pago | Sim (pagamentos) |

### Frontend (frontend/.env)

| Variavel | Descricao | Obrigatorio |
|----------|-----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Chave publica Clerk | Sim |
| `VITE_API_URL` | URL da API backend | Sim |
| `VITE_MP_PUBLIC_KEY` | Chave publica Mercado Pago | Sim |

## Endpoints da API

### Autenticacao
- `POST /api/auth/sync` - Sincronizar usuario Clerk
- `GET /api/auth/user/:clerkId` - Buscar usuario por Clerk ID
- `GET /api/auth/me` - Usuario atual (protegido)

### Lojas
- `POST /api/stores` - Criar loja (protegido)
- `GET /api/stores/me` - Minha loja (protegido)
- `PATCH /api/stores/me` - Atualizar loja (protegido)
- `GET /api/stores/slug/:slug` - Ver loja publica
- `GET /api/stores` - Listar lojas ativas

### Anuncios
- `POST /api/listings` - Criar anuncio (protegido)
- `GET /api/listings/my` - Meus anuncios (protegido)
- `DELETE /api/listings/:id` - Deletar anuncio (protegido)
- `GET /api/listings/:id` - Ver anuncio
- `GET /api/listings` - Listar anuncios publicos (com filtros)

### Carrinho
- `GET /api/cart` - Obter carrinho (protegido)
- `POST /api/cart/add` - Adicionar item (protegido)
- `DELETE /api/cart/remove/:listingId` - Remover item (protegido)

### Uploads
- `POST /api/uploads/listing-photos` - Upload fotos de anuncio (protegido)
- `POST /api/uploads/store-image` - Upload imagem da loja (protegido)

### Cartas (Pokemon TCG)
- `GET /api/cards` - Buscar cartas com filtros
- `GET /api/cards/:id` - Detalhes de uma carta
- `GET /api/sets` - Listar conjuntos
- `GET /api/rarities` - Listar raridades

## Scripts

### Backend
```bash
npm run dev      # Desenvolvimento com nodemon
npm start        # Producao
```

### Frontend
```bash
npm run dev      # Desenvolvimento com hot reload
npm run build    # Build de producao
npm run lint     # Verificacao de codigo
npm run preview  # Preview do build
```

## Stack Tecnico

- **Frontend:** React 19, Vite, React Router, Tailwind CSS
- **Backend:** Express, Mongoose, Helmet, CORS, Morgan
- **Auth:** Clerk
- **Pagamentos:** Mercado Pago
- **Banco:** MongoDB

## Licenca

ISC
