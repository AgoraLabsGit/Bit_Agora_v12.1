# Data Handling Protocol
## BitAgora POS - Frontend-First Data Implementation Strategy

### Overview
This document establishes the mandatory protocol for handling ALL data in BitAgora POS system, ensuring consistency with our Frontend-First Mock Database Strategy and preventing hardcoded data issues.

---

## 🔧 Core Protocol: 7-Step Data Implementation

### **Step 1: API-First Design**
Create API endpoint first with proper CRUD operations:
```typescript
// app/api/[entity]/route.ts
export async function GET(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const result = await entityAPI.getEntity(merchantId)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }
    
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### **Step 2: Mock Database Integration**
Use mockStorage with standardized key pattern:
```typescript
// lib/[entity]-api.ts
class EntityDatabase {
  private useMock = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false'
  
  private getStorageKey(merchantId: string): string {
    return `bitagora_[entity]_${merchantId}`
  }
  
  async getEntity(merchantId: string): Promise<ApiResponse<Entity>> {
    try {
      const key = this.getStorageKey(merchantId)
      const stored = mockStorage.getItem(key)
      const data = stored ? JSON.parse(stored) : []
      
      return { success: true, data }
    } catch (error) {
      return { success: false, error: 'Failed to fetch entity' }
    }
  }
}
```

### **Step 3: TypeScript Interface Definition**
Define data structure with proper typing:
```typescript
// lib/[entity]-api.ts
export interface Entity {
  id: string
  merchantId: string
  // ... entity-specific fields
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

### **Step 4: Zod Validation Schema**
Create validation schema for runtime type checking:
```typescript
// lib/[entity]-api.ts
import { z } from 'zod'

export const EntitySchema = z.object({
  // Define validation rules for each field
  name: z.string().min(1, 'Name is required'),
  active: z.boolean(),
  // ... other fields
})
```

### **Step 5: Multi-tenant Isolation**
Always use merchantId for data separation:
```typescript
// Always use merchantId for data separation
private getStorageKey(merchantId: string): string {
  return `bitagora_[entity]_${merchantId}`
}

// Include in all operations
async saveEntity(merchantId: string, entityData: Partial<Entity>) {
  // Implementation with merchantId isolation
}
```

### **Step 6: Production Ready Environment Toggle**
Prepare for future database integration:
```typescript
// Future database integration point
private async executeQuery(operation: string, data?: any): Promise<any> {
  if (this.useMock) {
    // Continue using mockStorage (current implementation)
    return { success: true, data }
  } else {
    // TODO: Implement real database operations
    throw new Error('Real database not implemented yet')
  }
}
```

### **Step 7: Standardized Response Format**
Always return consistent response format:
```typescript
// Always return this format
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Example success response
return { 
  success: true, 
  data: entity, 
  message: 'Entity retrieved successfully' 
}

// Example error response
return { 
  success: false, 
  error: 'Entity not found' 
}
```

---

## 📋 Implementation Checklist

### **Before Adding Any New Data Entity:**
- [ ] **Define the data structure** with TypeScript interface
- [ ] **Create API endpoint** following the pattern
- [ ] **Implement mock database operations** using mockStorage
- [ ] **Add Zod validation schema** for data integrity
- [ ] **Include multi-tenant isolation** via merchantId
- [ ] **Test CRUD operations** with proper error handling
- [ ] **Document the new entity** in relevant docs

### **For Each New API Endpoint:**
- [ ] **GET endpoint** for retrieving data
- [ ] **POST endpoint** for creating new records
- [ ] **PUT endpoint** for updating existing records
- [ ] **DELETE endpoint** for removing records (if needed)
- [ ] **Proper error handling** with appropriate HTTP status codes
- [ ] **Input validation** using Zod schemas
- [ ] **Response standardization** with ApiResponse format

### **For Each New Component Using Data:**
- [ ] **Never use localStorage directly** - always go through API
- [ ] **Never hardcode data** - fetch from API endpoints
- [ ] **Include loading states** for async operations
- [ ] **Handle error states** gracefully
- [ ] **Use proper TypeScript typing** for all data
- [ ] **Follow React best practices** for state management

---

## 🚫 Anti-Patterns to Avoid

### **❌ Never Do This:**
1. **Direct localStorage usage** in components
2. **Hardcoded data arrays** in components
3. **Component-level state** for persistent data
4. **Mock data files** (like `mock-products.ts`)
5. **Global state managers** for API data
6. **Direct database calls** from components
7. **Inconsistent API response formats**

### **✅ Always Do This:**
1. **Use API endpoints** for all data operations
2. **Go through mock database layer** for persistence
3. **Use proper TypeScript interfaces** for type safety
4. **Implement proper error handling** in all operations
5. **Follow the established patterns** in existing code
6. **Include proper validation** with Zod schemas
7. **Maintain multi-tenant isolation** with merchantId

---

## 📁 File Structure Pattern

```
lib/
├── [entity]-api.ts          # Database operations & interfaces
├── mock-storage.ts          # Mock storage abstraction
└── utils.ts                 # Shared utilities

app/api/
└── [entity]/
    └── route.ts            # API endpoints (GET, POST, PUT, DELETE)

components/
└── [entity]/
    ├── [Entity]List.tsx    # List component
    ├── [Entity]Form.tsx    # Form component
    └── [Entity]Card.tsx    # Display component
```

---

## 🔄 Migration Preparation

### **Current Mock Database (Development):**
```typescript
// Uses mockStorage with localStorage
const key = `bitagora_${entity}_${merchantId}`
mockStorage.setItem(key, JSON.stringify(data))
```

### **Future Real Database (Production):**
```typescript
// Will use Prisma/Supabase
const result = await prisma.entity.create({
  data: { ...entityData, merchantId }
})
```

### **Environment Toggle Ready:**
```typescript
private useMock = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false'
```

---

## 🧪 Testing Strategy

### **For Each New Entity:**
```typescript
// Test mock database operations
describe('Entity Mock Database', () => {
  beforeEach(() => {
    mockStorage.clear()
  })

  it('should create and retrieve entity', async () => {
    const merchantId = 'test-merchant'
    const entityData = { name: 'Test Entity', active: true }
    
    const saveResult = await entityAPI.saveEntity(merchantId, entityData)
    expect(saveResult.success).toBe(true)
    
    const getResult = await entityAPI.getEntity(merchantId)
    expect(getResult.success).toBe(true)
    expect(getResult.data?.name).toBe('Test Entity')
  })
})
```

---

## 📊 Complete Example: Customer Entity

### **Customer API Implementation:**
```typescript
// lib/customer-api.ts
export interface Customer {
  id: string
  merchantId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  loyaltyPoints: number
  createdAt: string
  updatedAt: string
}

export const CustomerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  loyaltyPoints: z.number().min(0).default(0),
})

class CustomerDatabase {
  private useMock = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false'
  
  private getStorageKey(merchantId: string): string {
    return `bitagora_customers_${merchantId}`
  }
  
  async getCustomers(merchantId: string): Promise<ApiResponse<Customer[]>> {
    try {
      const key = this.getStorageKey(merchantId)
      const stored = mockStorage.getItem(key)
      const customers = stored ? JSON.parse(stored) : []
      
      return { success: true, data: customers }
    } catch (error) {
      return { success: false, error: 'Failed to fetch customers' }
    }
  }
  
  async saveCustomer(merchantId: string, customerData: Partial<Customer>): Promise<ApiResponse<Customer>> {
    try {
      const validation = CustomerSchema.safeParse(customerData)
      if (!validation.success) {
        return { success: false, error: 'Invalid customer data' }
      }
      
      const customers = await this.getCustomers(merchantId)
      const existingCustomers = customers.data || []
      
      const newCustomer: Customer = {
        id: customerData.id || this.generateId(),
        merchantId,
        ...customerData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Customer
      
      existingCustomers.push(newCustomer)
      
      const key = this.getStorageKey(merchantId)
      mockStorage.setItem(key, JSON.stringify(existingCustomers))
      
      return { success: true, data: newCustomer, message: 'Customer saved successfully' }
    } catch (error) {
      return { success: false, error: 'Failed to save customer' }
    }
  }
  
  private generateId(): string {
    return Math.random().toString(36).substr(2, 11)
  }
}

export const customerAPI = new CustomerDatabase()
```

### **Customer API Routes:**
```typescript
// app/api/customers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { customerAPI, getCurrentMerchantId } from '@/lib/customer-api'

export async function GET(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const result = await customerAPI.getCustomers(merchantId)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }
    
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const merchantId = getCurrentMerchantId()
    const customerData = await request.json()
    
    const result = await customerAPI.saveCustomer(merchantId, customerData)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }
    
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## 🎯 Key Benefits

### **Development Benefits:**
1. **Consistency** - All data follows the same pattern
2. **Type Safety** - TypeScript interfaces prevent errors
3. **Validation** - Zod schemas ensure data integrity
4. **Testing** - Mock database enables comprehensive testing
5. **Migration Ready** - Environment toggle for production

### **Production Benefits:**
1. **Scalability** - Multi-tenant architecture ready
2. **Performance** - Optimized for production databases
3. **Security** - Proper validation and error handling
4. **Maintainability** - Clear separation of concerns

---

## 📖 Related Documentation

- **[Database Strategy](Database%20Strategy)** - Overall database approach
- **[Frontend Development Strategy](Frontend%20Development%20Strategy)** - Frontend-first methodology
- **[Payment Settings Database Schema](Payment%20Settings%20Database%20Schema)** - Example implementation
- **[Project Context](Project%20Context)** - Technical requirements

---

## ⚠️ Enforcement

### **This Protocol is MANDATORY**
- **All new data** must follow this protocol
- **No exceptions** for quick implementations
- **Code reviews** must verify compliance
- **Refactor existing code** that violates these patterns

### **Consequences of Non-Compliance:**
- **Technical debt** accumulation
- **Data inconsistency** issues
- **Migration difficulties** to production
- **Maintenance overhead** increase

---

**Last Updated**: January 7, 2025  
**Version**: 1.0  
**Status**: Active - Mandatory Compliance Required 