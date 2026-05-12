# TCG Marketplace - Roadmap

## Visão Geral do Projeto

Marketplace para cartas colecionáveis (Pokemon TCG e outros) com autenticação via Clerk, múltiplos vendedores e carrinho unificado.

---

## Stack Tecnológico

- **Frontend**: React + Vite + Clerk
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Autenticação**: Clerk (webhook para Users)

---

## Modelos Existentes

| Modelo | Descrição |
|--------|-----------|
| User | Usuário synced do Clerk |
| Store | Loja do vendedor |
| Listing | Anúncio do produto |
| Order | Pedido (compra) |

---

## Roadmap de Desenvolvimento

### Fase 1: Core + Carrinho

**Objetivo**: Criar anúncio → adicionar ao carrinho → ver no backend

- [ ] Webhook Clerk - Sincronizar usuários automaticamente
  - Criar endpoint `/api/webhooks/clerk`
  - Criar/atualizar User quando novo login no Clerk
- [ ] Modelo Cart - Persistir carrinho no MongoDB
  - Currently está apenas em localStorage (frontend)
  - Precisa sincronização backend para compras
- [ ] Endpoints Carrinho - CRUD completo
  - GET /api/cart
  - POST /api/cart/items
  - DELETE /api/cart/items/:id
  - PUT /api/cart/clear
- [ ] Conectar frontend CartContext com backend

**Dependências**: Clerk webhook secret, MongoDB conectado

---

### Fase 2: Busca e Listagem

**Objetivo**: Exibir anúncios e permitir busca

- [ ] Endpoint busca com filtros
  - name, setName, rarity
  - price min/max
  - condition (NM, LP, MP, HP, DM)
  - certified
- [ ] Listagem home page
  - GET /api/listings (com pagination)
  - GET /api/listings/featured
- [ ] Detalhes do listing API
  - GET /api/listings/:id

---

### Fase 3: Checkout e Pedidos

**Objetivo**: Fluxo completo de compra

- [ ] Fluxo checkout completo
  - Validar estoque (quantity > 0)
  - Calcular total por loja
  - Separar por seller (múltiplos pedidos)
- [ ] Criação de Orders
  - Um Order por loja/seller
  - Gerar orderNumber único
  - Status tracking
- [ ] Endpoints Orders
  - GET /api/orders (buyer)
  - GET /api/orders/seller (seller)
  - PUT /api/orders/:id/status

---

### Fase 4: Avaliações

**Objetivo**: Sistema de confiança

- [ ] Modelo Review
  - rating (1-5)
  - comment
  - orderId
  - storeId
  - userId
- [ ] Calcular rating da loja
  - Média das reviews
  - Contagem de reviews
- [ ] Endpoints Reviews
  - POST /api/stores/:id/reviews
  - GET /api/stores/:id/reviews

---

### Fase 5: Pagamentos

**Objetivo**: Processar pagamentos

- [ ] Integração gateway
  - MercadoPago ou similar
  - Suporte PIX (popular no BR)
- [ ] Webhooks pagamento
  - Confirmar pagamento
  - Atualizar status Order
- [ ] Fluxo de reembolso

---

## Status Atual

| Recurso | Status |
|---------|--------|
| User (Clerk sync) | ⚠️ Precisa webhook |
| Store | ✅ Pronto |
| Listing | ✅ Pronto |
| Order | ✅ Pronto (modelo) |
| Cart | ⚠️ Só localStorage |
| Reviews | ❌ Não existe |

---

## Priorização Sugerida

1. **Imediato**: Fase 1 (Core + Carrinho)
2. **Curto prazo**: Fase 2 (Busca/Listagem)
3. **Médio prazo**: Fase 3 (Checkout/Pedidos)
4. **Longo prazo**: Fases 4 e 5 (Reviews + Pagamentos)

---

## Notas Técnicas

### Fluxo Atual (Frontend)
- Usuário faz login no Clerk → sincroniza com backend na primeira vez
- Usuário cria Store → listings → adiciona ao carrinho
- Carrinho目前在 localStorage (precisa migrar para MongoDB)

### Carrinho Multi-Vendedor
- Um carrinho pode conter itens de múltiplas lojas
- No checkout, criar um Order por loja (seller diferente)
- Frete calculado individualmente por seller

---

## Referências

- Frontend: `C:\Users\brnqu\Documents\projetos\TCG-MarketPlace\frontend`
- Backend: `C:\Users\brnqu\Documents\projetos\TCG-MarketPlace\backend`
- Clerk Docs: https://clerk.com/docs
- Pokemon TCG API: https://api.pokemontcg.io