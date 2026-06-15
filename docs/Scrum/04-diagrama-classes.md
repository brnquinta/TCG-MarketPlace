# 04 — Diagrama de Classes (UML)

## Classes do Domínio

```mermaid
classDiagram
    class User {
        +String clerkId
        +String email
        +String firstName
        +String lastName
        +String imageUrl
        +Date createdAt
        +Date updatedAt
    }

    class Store {
        +ObjectId userId
        +String name
        +String slug
        +String logoUrl
        +String bannerUrl
        +String description
        +Object location
        +String status
        +String onboardingStatus
        +Object rating
        +Object stats
        +Object contact
        +Object paymentInfo
        +Date createdAt
        +Date updatedAt
    }

    class Listing {
        +ObjectId storeId
        +ObjectId userId
        +Object cardSnapshot
        +Object listingData
        +Object photos
        +String status
        +Number views
        +Date soldAt
        +Date createdAt
        +Date updatedAt
    }

    class Cart {
        +ObjectId userId
        +Array items
        +Date updatedAt
    }

    class CartItem {
        +ObjectId listingId
        +Number price
        +Date addedAt
    }

    class Order {
        +String orderNumber
        +ObjectId buyerId
        +ObjectId sellerId
        +Array items
        +Number total
        +String status
        +Object shipping
        +Object payment
        +String notes
        +Date createdAt
        +Date updatedAt
    }

    class OrderItem {
        +ObjectId listingId
        +String cardName
        +String cardImage
        +Number price
        +Number quantity
    }

    User "1" --> "1" Store : possui
    User "1" --> "N" Listing : cria
    User "1" --> "1" Cart : tem
    User "1" --> "N" Order : compra (buyer)
    User "1" --> "N" Order : vende (seller)
    Store "1" --> "N" Listing : contém
    Cart "1" --> "N" CartItem : contém
    Order "1" --> "N" OrderItem : contém
    Listing "1" --> "N" CartItem : referenciado em
    Listing "1" --> "N" OrderItem : referenciado em

    class CardSnapshot {
        +String cardId
        +String name
        +String number
        +String rarity
        +String supertype
        +String[] subtypes
        +String imageSmall
        +String imageLarge
        +String setId
        +String setName
        +String setSeries
        +String setReleaseDate
    }

    class ListingData {
        +String language
        +String condition
        +Number price
        +Number quantity
        +Boolean certified
        +String gradingCompany
        +String grade
        +Boolean acceptsOffer
        +String description
        +String defects
        +Boolean shippingAvailable
        +Boolean localPickup
        +String city
        +String state
    }

    Listing "1" --> "1" CardSnapshot : contém
    Listing "1" --> "1" ListingData : contém
```

## Relacionamentos

| Classe A | Relacionamento | Classe B | Tipo | Regra |
|----------|---------------|----------|------|-------|
| User | → | Store | 1:1 | Um usuário = uma loja |
| User | → | Listing | 1:N | Um usuário tem N anúncios |
| User | → | Cart | 1:1 | Um carrinho por usuário |
| User | → | Order (buyer) | 1:N | Um usuário faz N pedidos |
| User | → | Order (seller) | 1:N | Um usuário vende N pedidos |
| Store | → | Listing | 1:N | Uma loja tem N anúncios |
| Listing | → | CartItem | 1:N | Um anúncio em N carrinhos |
| Listing | → | OrderItem | 1:N | Um anúncio em N pedidos |
| Cart | → | CartItem | composição | Itens embutidos no carrinho |
| Order | → | OrderItem | composição | Itens embutidos no pedido |

## Notas Técnicas

- `CardSnapshot` e `ListingData` são objetos embutidos (embedded) em `Listing`, não coleções separadas
- `CartItem` é um subdocumento embutido em `Cart`
- `OrderItem` é um subdocumento embutido em `Order`
- `Order` tem modelo definido mas **não tem rotas nem controllers** implementados
