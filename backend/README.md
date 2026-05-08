# TCG Marketplace - Backend

## Pré-requisitos
- Node.js 18+
- MongoDB instalado e rodando

## Instalação

```bash
cd backend
npm install
```

## Configuração

Crie um arquivo `.env` com base no exemplo:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/tcg-marketplace
NODE_ENV=development
CLERK_SECRET_KEY=your_clerk_secret_key_here
```

## Executar

```bash
# Desenvolvimento (com nodemon)
npm run dev

# Produção
npm start
```

## API Endpoints

### Auth
- `POST /api/auth/sync` - Sincronizar usuário Clerk
- `GET /api/auth/user/:clerkId` - Buscar usuário por Clerk ID
- `GET /api/auth/me` - Usuário atual (protegido)

### Stores
- `POST /api/stores` - Criar loja (protegido)
- `GET /api/stores/me` - Minha loja (protegido)
- `PUT /api/stores/me` - Atualizar loja (protegido)
- `GET /api/stores/slug/:slug` - Ver loja pública
- `GET /api/stores` - Listar lojas ativas

### Listings
- `POST /api/listings` - Criar anúncio (protegido)
- `GET /api/listings/my` - Meus anúncios (protegido)
- `PUT /api/listings/:id` - Atualizar anúncio (protegido)
- `DELETE /api/listings/:id` - Deletar anúncio (protegido)
- `GET /api/listings/:id` - Ver anúncio
- `GET /api/listings` - Listar anúncios públicos (com filtros)

## Filtros de Listagem
```
GET /api/listings?minPrice=100&maxPrice=500&condition=NM&certified=true&setName=Base%20Set&language=EN&search=charizard
```