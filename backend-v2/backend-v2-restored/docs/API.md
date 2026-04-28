# 📘 API Documentation - Rotiserie & Pizza Moinești

## Base URL
```
Development: http://localhost:5000
Production: https://api-rotiserie.onrender.com (exemplu)
```

---

## Endpoints

### 🏥 Health Check
```
GET /health
```
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-04-20T10:30:00.000Z",
  "uptime": 120,
  "environment": "development"
}
```

---

### 📦 Produse

#### GET /api/products
Lista tuturor produselor.

**Query params:**
- `category` - filtrare după categorie (ID)
- `search=term` - căutare text
- `available=true` - doar disponibile
- `popular=true` - doar populare
- `minPrice=10` - preț minim
- `maxPrice=50` - preț maxim
- `page=1` - pagină (default: 1)
- `limit=20` - rezultate per pagină (default: 50)

**Response:**
```json
{
  "success": true,
  "count": 15,
  "total": 45,
  "page": 1,
  "pages": 3,
  "data": [
    {
      "_id": "...",
      "name": "Pizza Margherita",
      "price": 28,
      "image": "...",
      "category": { "_id": "...", "name": "Pizza" },
      "isAvailable": true,
      "isPopular": true
    }
  ]
}
```

#### GET /api/products/:id
Detalii produs.

#### POST /api/products
Creare produs nou (doar admin).

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Pizza Diavola",
  "description": "Pizza picantă cu salam și ardei",
  "price": 32,
  "image": "url-imagine",
  "category": "id-categorie",
  "ingredients": ["salam", "ardei", "mozzarella"],
  "preparationTime": 20
}
```

#### PUT /api/products/:id
Update produs (doar admin).

#### DELETE /api/products/:id
Ștergere produs (doar admin).

---

### 📁 Categorii

#### GET /api/categories
Lista categoriilor active (public).

#### POST /api/categories
Creare categorie (doar admin).

**Body:**
```json
{
  "name": "Pizza",
  "description": "Pizza artizanală",
  "order": 1
}
```

---

### 📋 Comenzi

#### GET /api/orders
Lista comenzi (admin/bucatarie/staff).

**Query params:**
- `status` - filtrare după status (primita, in_preparare, gata, livrata, anulata)
- `limit` - număr rezultate (default: 50)
- `page` - paginare (default: 1)

#### GET /api/orders/:id
Detalii comandă (admin/bucatarie/staff).

#### POST /api/orders
Plasare comandă (public - orice client).

**Body:**
```json
{
  "customer": {
    "name": "Ion Popescu",
    "phone": "0722 123 456",
    "email": "ion@example.com",
    "address": "Strada Moinești 10"
  },
  "items": [
    {
      "product": "id-produs",
      "name": "Pizza Margherita",
      "quantity": 2,
      "price": 28,
      "observations": "Extra mozzarella"
    }
  ],
  "totalAmount": 56,
  "paymentMethod": "card",
  "observations": "Livrare rapidă"
}
```

#### PUT /api/orders/:id/status
Update status comandă (admin/bucatarie/staff).

**Body:**
```json
{
  "status": "in_preparare"
}
```

---

### 🔐 Autentificare

#### POST /api/auth/register
Înregistrare utilizator (doar admin).

**Body:**
```json
{
  "username": "admin",
  "email": "admin@rotiserie.ro",
  "password": "parola123",
  "role": "admin"
}
```

#### POST /api/auth/login
Login.

**Body:**
```json
{
  "username": "admin",
  "password": "parola123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "id": "...",
    "username": "admin",
    "email": "admin@rotiserie.ro",
    "role": "admin"
  }
}
```

#### GET /api/auth/me
Profil utilizator curent (necesită token).

**Headers:**
```
Authorization: Bearer <token>
```

---

### 💳 Plăți Stripe

#### GET /api/payments/config
Configurare Stripe - publishable key (public).

**Response:**
```json
{
  "success": true,
  "publishableKey": "pk_test_...",
  "currency": "ron"
}
```

#### POST /api/payments/create-payment-intent
Creare intenție de plată (public).

**Body:**
```json
{
  "amount": 56,
  "orderId": "id-comanda",
  "currency": "ron",
  "customerEmail": "client@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "clientSecret": "pi_123_secret_...",
  "paymentIntentId": "pi_123",
  "amount": 56,
  "currency": "ron"
}
```

#### POST /api/payments/confirm
Verificare status plată.

**Body:**
```json
{
  "paymentIntentId": "pi_123"
}
```

**Response:**
```json
{
  "success": true,
  "status": "succeeded",
  "paymentIntent": {
    "id": "pi_123",
    "status": "succeeded",
    "amount": 56,
    "currency": "ron"
  }
}
```

#### POST /api/payments/refund
Rambursare plată (doar admin).

**Body:**
```json
{
  "paymentIntentId": "pi_123",
  "amount": 56
}
```

#### POST /api/payments/webhook
Webhook Stripe (raw body).

**Events handle-uite:**
- `payment_intent.succeeded` → Comandă marcată plătită
- `payment_intent.payment_failed` → Comandă marcată eșuată
- `charge.succeeded` → Log

---

### 🌱 Seed / Test

#### Rulare seed database
```bash
node seed.js
```
Creează:
- 4 categorii (Pizza, Rotiserie, Garnituri, Băuturi)
- 10 produse
- 1 admin user: `admin` / `admin123`

---

## Statusuri Comandă

| Status | Descriere |
|--------|-----------|
| `primita` | Comandă nouă |
| `in_preparare` | Se pregătește |
| `gata` | Gata de livrare/ridicare |
| `livrata` | Livrată clientului |
| `anulata` | Comandă anulată |

## Statusuri Plată

| Status | Descriere |
|--------|-----------|
| `pending` | Așteaptă plată |
| `paid` | Plătită |
| `failed` | Plată eșuată |
| `refunded` | Rambursată |

## Roluri Utilizator

| Rol | Acces |
|-----|-------|
| `admin` | Full access (CRUD tot) |
| `bucatarie` | Vede comenzi, update status |
| `staff` | Vede comenzi |

---

## Coduri Eroare

| Cod | Descriere |
|-----|-----------|
| 400 | Bad Request - Date invalide |
| 401 | Unauthorized - Token lipsă/invalid |
| 403 | Forbidden - Rol insuficient |
| 404 | Not Found - Resursă negăsită |
| 500 | Internal Server Error |

## Carduri Test Stripe

| Card | Rezultat |
|------|----------|
| `4242 4242 4242 4242` | Plată reușită |
| `4000 0000 0000 0002` | Card declinat |
| `4000 0000 0000 0127` | Fonduri insuficiente |
