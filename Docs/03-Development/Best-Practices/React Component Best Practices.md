# React Component Best Practices

## Critical React Pitfalls - NEVER DO THIS!

### ⚠️ **CRITICAL WARNING: useEffect Dependency Array Hell**

**NEVER include event handlers in useEffect dependency arrays unless absolutely necessary!**

```typescript
// ❌ WRONG - This creates an infinite loop!
const handleMethodSelect = (method: string) => {
  setSelectedMethod(method)
}

useEffect(() => {
  setSelectedMethod('default')
  handleMethodSelect('default') // This triggers the effect again!
}, [handleMethodSelect]) // ← This dependency causes infinite loop!

// Button click → handleMethodSelect → useEffect → reset to default → repeat forever
```

```typescript
// ✅ CORRECT - Remove event handler dependencies
useEffect(() => {
  if (!selectedMethod) { // Only set if nothing selected
    setSelectedMethod('default')
    handleMethodSelect('default')
  }
}, []) // Empty dependency array = runs once only

// OR use useCallback to memoize the handler
const handleMethodSelect = useCallback((method: string) => {
  setSelectedMethod(method)
}, [])
```

**Real Example from BitAgora Crypto Payment Bug:**
- Crypto buttons were "working" but immediately resetting to Lightning
- useEffect had `onMethodSelect` in dependency array
- Every button click triggered useEffect which reset the selection
- **Solution**: Remove dependency, add guard condition, run once only

### 🔥 **Other Critical React Rules**

1. **State Updates Are Async**: Never assume state is updated immediately
2. **Event Handler Stability**: Use useCallback for handlers passed to children
3. **Effect Cleanup**: Always clean up subscriptions and timers
4. **Key Prop Stability**: Don't use array indices as keys for dynamic lists

## Standard Component Patterns

### Component Structure
```typescript
export const MyComponent = ({ prop1, prop2 }: Props) => {
  // 1. State declarations
  const [state, setState] = useState(initial)
  
  // 2. Refs
  const ref = useRef<HTMLElement>(null)
  
  // 3. Custom hooks
  const { data, loading } = useCustomHook()
  
  // 4. Memoized values
  const memoizedValue = useMemo(() => computation, [deps])
  
  // 5. Callbacks (use useCallback for stability)
  const handleClick = useCallback(() => {
    // Handler logic
  }, [deps])
  
  // 6. Effects (be careful with dependencies!)
  useEffect(() => {
    // Effect logic
    return cleanup // Always return cleanup if needed
  }, [deps])
  
  // 7. Early returns
  if (loading) return <Spinner />
  if (error) return <Error />
  
  // 8. Render
  return <div>...</div>
}
```

### Event Handlers
```typescript
// ✅ Good
const handleSubmit = useCallback((data: FormData) => {
  onSubmit(data)
}, [onSubmit])

// ❌ Bad - recreated every render
const handleSubmit = (data: FormData) => {
  onSubmit(data)
}
```

### State Updates
```typescript
// ✅ Good - functional update
setCount(prev => prev + 1)

// ❌ Bad - may use stale state
setCount(count + 1)
```

---

## 🎯 **Core Principles**

### **1. MVP-First Approach**
- ✅ **Ship working features first**, refactor second
- ✅ **Incremental improvements** over major rewrites
- ✅ **Backwards compatibility** maintained during refactoring
- ⚠️ **Technical debt acceptable** if documented and planned for

### **2. Component Architecture**
```typescript
// ✅ GOOD: Single Responsibility
const UserProfileForm = () => { /* handles only user profile */ }
const PaymentMethodCard = () => { /* handles only one payment method */ }

// ❌ BAD: Multiple Responsibilities  
const AdminPanel = () => { /* handles users, payments, settings, analytics */ }
```

### **3. File Organization Standard**
```
components/
├── [feature]/
│   ├── types/           # TypeScript interfaces
│   ├── services/        # API operations
│   ├── hooks/          # Custom hooks
│   ├── components/     # UI components
│   └── index.ts        # Public exports
```

---

## 📋 **Component Size Guidelines**

### **Size Limits**
- 🟢 **< 150 lines**: Ideal size for most components
- 🟡 **150-300 lines**: Acceptable, consider splitting
- 🔴 **> 300 lines**: Requires refactoring plan

### **Complexity Indicators**
- **Multiple useEffect hooks** → Extract custom hooks
- **Nested conditionals** → Split into sub-components  
- **Long prop lists** → Create configuration objects
- **Inline API calls** → Move to service layer

---

## 🏗️ **Architecture Patterns**

### **1. Service Layer Pattern**
```typescript
// ✅ Centralized API Operations
export class FeatureAPI {
  static async loadData(): Promise<FeatureData> {
    // Handle all API logic here
  }
  
  static async saveData(data: FeatureData): Promise<void> {
    // Centralized error handling
  }
}

// ❌ Scattered API Calls
const Component = () => {
  const [data, setData] = useState()
  
  useEffect(() => {
    fetch('/api/endpoint').then(/* ... */) // API logic mixed with UI
  }, [])
}
```

### **2. Custom Hooks Pattern**
```typescript
// ✅ Reusable State Logic
const useFormValidation = (schema: ValidationSchema) => {
  // Extract complex state management
  return { errors, validate, isValid }
}

// ✅ Feature-Specific Logic
const usePaymentSettings = () => {
  // Encapsulate payment-related operations
  return { settings, loading, save, errors }
}
```

### **3. Type-First Development**
```typescript
// ✅ Define interfaces before implementation
interface PaymentFormData {
  acceptCash: boolean
  acceptCards: boolean
  fees: PaymentFees
  // Complete type definition
}

// ✅ Use discriminated unions for state
type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: PaymentData }
  | { status: 'error'; error: string }
```

---

## 🔧 **Implementation Standards**

### **1. Error Handling**
```typescript
// ✅ Comprehensive Error Boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <PaymentSettings />
</ErrorBoundary>

// ✅ Service Layer Error Handling
try {
  await PaymentAPI.save(data)
  showSuccessMessage()
} catch (error) {
  handleError(error) // Centralized error handling
}

// ✅ User-Friendly Error Messages
const ErrorFallback = ({ error, resetError }) => (
  <div className="error-container">
    <h2>Something went wrong</h2>
    <p>{getReadableError(error)}</p>
    <Button onClick={resetError}>Try Again</Button>
  </div>
)
```

### **2. Loading States**
```typescript
// ✅ Consistent Loading Patterns
const useAsyncOperation = () => {
  const [state, setState] = useState<LoadingState>({ status: 'idle' })
  
  const execute = async (operation: () => Promise<any>) => {
    setState({ status: 'loading' })
    try {
      const data = await operation()
      setState({ status: 'success', data })
    } catch (error) {
      setState({ status: 'error', error: error.message })
    }
  }
  
  return { state, execute }
}
```

### **3. Form Management**
```typescript
// ✅ Controlled Components with Validation
const useFormData = <T>(initialData: T, validationSchema?: ValidationSchema) => {
  const [data, setData] = useState<T>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const updateField = (field: keyof T, value: T[keyof T]) => {
    setData(prev => ({ ...prev, [field]: value }))
    // Real-time validation
    if (validationSchema) {
      validateField(field, value)
    }
  }
  
  return { data, errors, updateField, isValid }
}
```

---

## 🎨 **UI/UX Standards**

### **1. Consistent Loading States**
```typescript
// ✅ Standard Loading Components
const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => (
  <div className="loading-container">
    <div className={`spinner spinner-${size}`} />
    <p>{message}</p>
  </div>
)

// ✅ Skeleton Loading for Lists
const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
  </div>
)
```

### **2. Error State Consistency**
```typescript
// ✅ Standardized Error Display
const ErrorDisplay = ({ 
  error, 
  action = 'operation',
  onRetry,
  showDetails = false 
}) => (
  <div className="error-state">
    <AlertTriangle className="h-8 w-8 text-red-500" />
    <h3>Failed to {action}</h3>
    <p>{getReadableError(error)}</p>
    {onRetry && <Button onClick={onRetry}>Try Again</Button>}
    {showDetails && <details>{JSON.stringify(error)}</details>}
  </div>
)
```

### **3. Form Validation UX**
```typescript
// ✅ Real-time Validation with Good UX
const FormField = ({ 
  label, 
  value, 
  onChange, 
  error, 
  required = false 
}) => (
  <div className="form-field">
    <label className={required ? 'required' : ''}>
      {label}
    </label>
    <input
      value={value}
      onChange={onChange}
      className={error ? 'error' : 'valid'}
      aria-invalid={!!error}
      aria-describedby={error ? `${label}-error` : undefined}
    />
    {error && (
      <span id={`${label}-error`} className="error-message">
        {error}
      </span>
    )}
  </div>
)
```

---

## 📊 **Performance Guidelines**

### **1. Component Optimization**
```typescript
// ✅ Memo for Expensive Components
const ExpensiveList = memo(({ items, onItemClick }) => {
  return items.map(item => (
    <ExpensiveItem 
      key={item.id} 
      item={item} 
      onClick={onItemClick} 
    />
  ))
})

// ✅ useCallback for Event Handlers
const ParentComponent = () => {
  const handleItemClick = useCallback((id: string) => {
    // Handle click logic
  }, [/* dependencies */])
  
  return <ExpensiveList onItemClick={handleItemClick} />
}
```

### **2. State Management**
```typescript
// ✅ Colocate State with Usage
const UserProfile = () => {
  const [name, setName] = useState('') // Only used here
  const [email, setEmail] = useState('') // Only used here
  
  // Don't lift state unnecessarily
}

// ✅ Use Context for Truly Global State
const ThemeContext = createContext<ThemeContextType>()
const UserContext = createContext<UserContextType>()
```

---

## 🧪 **Testing Standards**

### **1. Testing Hierarchy**
```typescript
// ✅ Test Custom Hooks
const { result } = renderHook(() => usePaymentSettings())
expect(result.current.loading).toBe(false)

// ✅ Test Service Layer
it('should save payment settings', async () => {
  const mockData = { acceptCash: true }
  await PaymentAPI.save(mockData)
  expect(mockApi.put).toHaveBeenCalledWith('/api/payment-settings', mockData)
})

// ✅ Test Component Integration
render(<PaymentSettings />)
fireEvent.click(screen.getByText('Save'))
expect(screen.getByText('Settings saved')).toBeInTheDocument()
```

### **2. Mock Strategy**
```typescript
// ✅ Mock External Dependencies
jest.mock('@/lib/payment-api', () => ({
  PaymentAPI: {
    save: jest.fn(),
    load: jest.fn()
  }
}))
```

---

## 📈 **Refactoring Strategy**

### **1. Incremental Approach**
1. **Extract Types** → Move to dedicated files
2. **Create Service Layer** → Centralize API calls
3. **Split Components** → Break down large components
4. **Add Custom Hooks** → Extract complex logic
5. **Optimize Performance** → Add memoization

### **2. Risk Mitigation**
- ✅ **Maintain existing APIs** during refactoring
- ✅ **Test each change** before moving to next
- ✅ **Document breaking changes** clearly
- ✅ **Have rollback plan** for each step

### **3. Success Metrics**
- 📊 **Component size** < 300 lines
- 📊 **Test coverage** > 80%
- 📊 **TypeScript errors** = 0
- 📊 **ESLint warnings** < 5

---

## 🚨 **Anti-Patterns to Avoid**

### **1. Component Anti-Patterns**
```typescript
// ❌ God Components
const AdminDashboard = () => {
  // 800+ lines handling everything
}

// ❌ Prop Drilling
<ComponentA>
  <ComponentB data={data}>
    <ComponentC data={data}>
      <ComponentD data={data} /> {/* data passed through 4 levels */}
    </ComponentC>
  </ComponentB>
</ComponentA>

// ❌ Mixed Concerns
const UserList = () => {
  // Mixing API calls, state management, UI rendering, validation
}
```

### **2. State Anti-Patterns**
```typescript
// ❌ Unnecessary State Lifting
const App = () => {
  const [modalOpen, setModalOpen] = useState(false) // Only used in Modal
}

// ❌ State Synchronization Issues
const [users, setUsers] = useState([])
const [userCount, setUserCount] = useState(0) // Derived state!
```

### **3. Performance Anti-Patterns**
```typescript
// ❌ Inline Object Creation
<Component style={{ marginTop: 20 }} /> // Creates new object every render

// ❌ Missing Dependencies
useEffect(() => {
  fetchData(userId) // userId not in dependencies
}, []) // Will cause stale closure bugs
```

---

## ✅ **Implementation Checklist**

### **Before Refactoring**
- [ ] Current functionality is working and tested
- [ ] Backup/branch created for rollback
- [ ] Refactoring plan documented
- [ ] Success criteria defined

### **During Refactoring**
- [ ] One change at a time
- [ ] Tests passing after each change
- [ ] TypeScript errors resolved
- [ ] Code review completed

### **After Refactoring**
- [ ] All functionality preserved
- [ ] Performance maintained or improved
- [ ] Code complexity reduced
- [ ] Documentation updated

---

## 🔗 **Related Documents**

- [Data Handling Protocol](./Data%20Handling%20Protocol)
- [Frontend Development Strategy](./Frontend%20Development%20Strategy)
- [Page Format Reference](./Page%20Format%20Reference)
- [Responsive Design System](./Responsive%20Design%20System.md)

---

*This document should be updated as BitAgora's codebase evolves and new patterns emerge.* 