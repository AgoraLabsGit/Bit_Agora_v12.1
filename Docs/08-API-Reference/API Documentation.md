# 📡 BitAgora POS API Documentation

## **📋 Overview**
Complete API reference for BitAgora POS system endpoints. All APIs follow REST principles with JSON payloads and consistent response formats.

## **🔧 Base Configuration**
- **Base URL**: `http://localhost:3000/api` (Development)
- **Content-Type**: `application/json`
- **Authentication**: Session-based (future: JWT tokens)
- **Rate Limiting**: 100 requests/minute (future implementation)

## **📊 Response Format**
All API responses follow this standardized format:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

---

## **👤 User Management APIs**

### **POST /api/users**
Create a new user account (business owner registration)

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "phone": "+1234567890",
  "adminUsername": "john_admin",
  "language": "en",
  "businessName": "Test Coffee Shop",
  "businessType": "restaurant",
  "industry": "Food & Beverage",
  "address": "123 Main St",
  "city": "Anytown",
  "state": "CA",
  "zipCode": "12345",
  "country": "US",
  "timezone": "America/Los_Angeles",
  "password": "securepassword",
  "subscriptionTier": "basic",
  "pin": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "john@example.com",
    "businessName": "Test Coffee Shop",
    "role": "admin",
    "createdAt": "2024-07-06T19:00:00Z"
  }
}
```

### **GET /api/users**
Get all users (admin only)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "businessName": "Test Coffee Shop",
      "role": "admin",
      "status": "active"
    }
  ]
}
```

---

## **🛍️ Product Management APIs**

### **GET /api/products**
Get all products for the current merchant

**Query Parameters:**
- `category` (optional): Filter by category
- `inStock` (optional): Filter by stock status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_123",
      "name": "Espresso",
      "price": 2.50,
      "category": "Beverages",
      "emoji": "☕",
      "description": "Rich espresso shot",
      "inStock": true,
      "stockQuantity": 100,
      "createdAt": "2024-07-06T19:00:00Z"
    }
  ]
}
```

### **POST /api/products**
Create a new product

**Request Body:**
```json
{
  "name": "Cappuccino",
  "price": 3.75,
  "category": "Beverages",
  "emoji": "☕",
  "description": "Espresso with steamed milk",
  "inStock": true,
  "stockQuantity": 50
}
```

### **PUT /api/products**
Update an existing product

**Request Body:**
```json
{
  "id": "prod_123",
  "name": "Updated Cappuccino",
  "price": 4.00,
  "stockQuantity": 75
}
```

### **DELETE /api/products**
Delete a product

**Request Body:**
```json
{
  "id": "prod_123"
}
```

---

## **💳 Transaction APIs**

### **GET /api/transactions**
Get transaction history

**Query Parameters:**
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date
- `paymentMethod` (optional): Filter by payment type
- `limit` (optional): Number of results (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "txn_123",
      "amount": 18.50,
      "paymentMethod": "bitcoin",
      "status": "completed",
      "items": [
        {
          "productId": "prod_123",
          "name": "Espresso",
          "quantity": 2,
          "price": 2.50
        }
      ],
      "timestamp": "2024-07-06T19:00:00Z",
      "receiptId": "RCP_123"
    }
  ]
}
```

### **POST /api/transactions**
Create a new transaction

**Request Body:**
```json
{
  "items": [
    {
      "productId": "prod_123",
      "quantity": 2
    }
  ],
  "paymentMethod": "bitcoin",
  "paymentDetails": {
    "address": "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
    "amount": 18.50
  }
}
```

---

## **👥 Employee Management APIs**

### **GET /api/employees**
Get all employees for the current merchant

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "emp_123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "admin",
      "pin": "1234",
      "status": "active",
      "createdAt": "2024-07-06T19:00:00Z"
    }
  ]
}
```

### **POST /api/employees**
Create a new employee

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "role": "cashier",
  "pin": "5678"
}
```

---

## **🏪 Business Analytics APIs**

### **GET /api/business-stats**
Get business statistics and analytics

**Response:**
```json
{
  "success": true,
  "data": {
    "todaysSales": 145.50,
    "weeklyRevenue": 1250.75,
    "monthlyRevenue": 5430.25,
    "totalTransactions": 87,
    "averageOrderValue": 16.72,
    "topProducts": [
      {
        "name": "Espresso",
        "sales": 24,
        "revenue": 60.00
      }
    ],
    "paymentMethods": {
      "cash": 45,
      "bitcoin": 30,
      "card": 25
    }
  }
}
```

---

## **⚙️ Payment Configuration APIs**

### **GET /api/payment-settings**
Get payment configuration

**Response:**
```json
{
  "success": true,
  "data": {
    "cashEnabled": true,
    "bitcoinEnabled": true,
    "lightningEnabled": true,
    "usdtEnabled": true,
    "cardEnabled": true,
    "bitcoinAddress": "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
    "lightningAddress": "user@domain.com",
    "usdtEthAddress": "0x742d35Cc6634C0532925a3b8D...",
    "usdtTronAddress": "TLPpM9EkQs4m9VD9K3s4k..."
  }
}
```

### **POST /api/payment-settings**
Update payment configuration

**Request Body:**
```json
{
  "bitcoinEnabled": true,
  "bitcoinAddress": "bc1qnew_address_here",
  "lightningEnabled": true,
  "lightningAddress": "newuser@domain.com"
}
```

### **GET /api/payment-credentials**
Get payment processor credentials

### **POST /api/payment-credentials**
Update payment processor credentials

### **GET /api/payment-fees**
Get payment method fee structure

### **GET /api/qr-providers**
Get QR code payment provider settings

---

## **🔐 Authentication APIs**

### **POST /api/auth/login**
Authenticate user login

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "john@example.com",
      "role": "admin",
      "businessName": "Test Coffee Shop"
    },
    "token": "jwt_token_here"
  }
}
```

---

## **🔄 Cart Session APIs**

### **GET /api/cart-sessions**
Get active cart sessions

### **POST /api/cart-sessions**
Create or update cart session

---

## **📋 Onboarding APIs**

### **GET /api/onboarding-progress**
Get onboarding completion status

**Response:**
```json
{
  "success": true,
  "data": {
    "personalInfo": true,
    "businessInfo": true,
    "paymentSetup": false,
    "qrSetup": false,
    "completionPercentage": 50
  }
}
```

### **POST /api/onboarding-progress**
Update onboarding progress

---

## **🚨 Error Handling**

### **Error Response Format:**
```json
{
  "success": false,
  "error": "INVALID_REQUEST",
  "message": "The request payload is invalid"
}
```

### **Common Error Codes:**
- `INVALID_REQUEST` - Malformed request
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Input validation failed
- `SERVER_ERROR` - Internal server error

### **HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

---

## **🧪 Testing**

### **Example cURL Commands:**
```bash
# Get products
curl -X GET http://localhost:3000/api/products

# Create product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Latte",
    "price": 4.50,
    "category": "Beverages",
    "emoji": "☕"
  }'

# Get business stats
curl -X GET http://localhost:3000/api/business-stats
```

---

## **🔧 Development Notes**

### **Environment Variables:**
- `NEXT_PUBLIC_USE_MOCK_API` - Toggle mock vs real APIs
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Token signing secret

### **Data Storage:**
- **Development**: `.bitagora-data/*.json` files
- **Production**: Supabase PostgreSQL database

### **Multi-tenancy:**
All data is isolated by `merchantId` to support multiple businesses on the same platform.

---

*Last Updated: July 6, 2025*  
*Version: 1.0* 