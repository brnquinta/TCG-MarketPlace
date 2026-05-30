# 05 — Modelo Entidade-Relacionamento (MER)

## Diagrama MER

```mermaid
erDiagram
    User ||--o| Store : "1 : 1"
    User ||--o{ Listing : "1 : N"
    User ||--o| Cart : "1 : 1"
    User ||--o{ Order : "1 : N (buyer)"
    Store ||--o{ Listing : "1 : N"
    Listing ||--o{ Cart : "N : M (via items)"
    Listing ||--o{ Order : "N : M (via items)"

    User {
        string clerkId PK "unique"
        string email UK
        string firstName
        string lastName
        string imageUrl
        date createdAt
        date updatedAt
    }

    Store {
        objectId _id PK
        objectId userId FK
        string name
        string slug UK
        string logoUrl
        string bannerUrl
        string description
        object location "city + state"
        enum status "draft | active | inactive | suspended"
        enum onboardingStatus "pending | in_progress | approved | rejected"
        object rating "average + reviewsCount"
        object stats "activeListings + totalSales + totalViews"
        object contact "phone + email"
        object paymentInfo "cpf + cnpj + bankAccount + pixKey"
    }

    Listing {
        objectId _id PK
        objectId storeId FK
        objectId userId FK
        object cardSnapshot "embedded card data"
        object listingData "embedded listing data"
        object photos "front90 + back90 + front45 + back45"
        enum status "draft | active | sold | inactive | removed"
        number views
        date soldAt
        object indexes "price, condition, setName, certified"
    }

    Cart {
        objectId _id PK
        objectId userId FK "unique"
        array items "embedded cart items"
    }

    CartItem {
        objectId listingId FK
        number price
        date addedAt
    }

    Order {
        objectId _id PK
        string orderNumber UK "ORDYYYYMM######"
        objectId buyerId FK
        objectId sellerId FK
        array items "embedded order items"
        number total
        enum status "pending | paid | processing | shipped | delivered | cancelled | refunded"
        object shipping "address + method + trackingCode"
        object payment "method + provider + transactionId"
        string notes
    }

    OrderItem {
        objectId listingId FK
        string cardName
        string cardImage
        number price
        number quantity
    }
```

## Especificação das Coleções

### Coleção: `users`
| Campo | Tipo | Restrições |
|-------|------|-----------|
| _id | ObjectId | PK, auto |
| clerkId | String | **unique**, indexado |
| email | String | **unique**, obrigatório |
| firstName | String | opcional |
| lastName | String | opcional |
| imageUrl | String | opcional |

### Coleção: `stores`
| Campo | Tipo | Restrições |
|-------|------|-----------|
| _id | ObjectId | PK, auto |
| userId | ObjectId | FK → users, **unique** (1:1) |
| name | String | obrigatório |
| slug | String | **unique**, lowercase |
| status | String | enum: draft, active, inactive, suspended |

### Coleção: `listings`
| Campo | Tipo | Restrições |
|-------|------|-----------|
| _id | ObjectId | PK, auto |
| storeId | ObjectId | FK → stores, indexado |
| userId | ObjectId | FK → users, indexado |
| listingData.price | Number | indexado |
| listingData.condition | String | indexado |
| listingData.certified | Boolean | indexado |
| cardSnapshot.setName | String | indexado |
| status | String | enum: draft, active, sold, inactive, removed |

### Coleção: `carts`
| Campo | Tipo | Restrições |
|-------|------|-----------|
| _id | ObjectId | PK, auto |
| userId | ObjectId | FK → users, **unique** (1:1) |
| items[].listingId | ObjectId | FK → listings |
| items[].price | Number | min: 0 |

### Coleção: `orders`
| Campo | Tipo | Restrições |
|-------|------|-----------|
| _id | ObjectId | PK, auto |
| orderNumber | String | **unique**, auto-gerado |
| buyerId | ObjectId | FK → users |
| sellerId | ObjectId | FK → users |
| total | Number | obrigatório |
| status | String | enum: 7 estados |

## Notas sobre o Modelo

1. **User → Store é 1:1** — cada usuário pode ter no máximo uma loja
2. **Cart usa userId unique** — garante 1 carrinho por usuário
3. **Itens embutidos** (embedded) em Cart e Order — sem coleção separada para items
4. **CardSnapshot** é cópia imutável dos dados da carta no momento da criação do anúncio
5. **Order não tem controller** — modelo definido mas sem rotas de API
