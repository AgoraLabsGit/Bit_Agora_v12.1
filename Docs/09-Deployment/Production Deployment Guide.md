# 🚀 BitAgora POS Production Deployment Guide

## **📋 Overview**
Complete guide for deploying BitAgora POS system to production, covering infrastructure setup, environment configuration, security hardening, and monitoring.

## **🎯 Deployment Objectives**
- **Reliability**: 99.9% uptime with automatic failover
- **Scalability**: Handle growth from 1 to 1000+ merchants
- **Security**: Production-grade security implementation
- **Performance**: Sub-200ms API response times
- **Monitoring**: Comprehensive observability

---

## **🏗️ Infrastructure Architecture**

### **Production Stack**
```
                    ┌─────────────────┐
                    │   Cloudflare    │
                    │   (CDN + WAF)   │
                    └─────────┬───────┘
                              │
                    ┌─────────┴───────┐
                    │   Vercel Edge   │
                    │   (Frontend)    │
                    └─────────┬───────┘
                              │
                    ┌─────────┴───────┐
                    │  Supabase API   │
                    │  (Database +    │
                    │   Auth + APIs)  │
                    └─────────┬───────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
    ┌───────┴───────┐ ┌───────┴───────┐ ┌───────┴───────┐
    │   Stripe      │ │   Lightning   │ │   Monitoring  │
    │   (Payments)  │ │   (Bitcoin)   │ │   (DataDog)   │
    └───────────────┘ └───────────────┘ └───────────────┘
```

### **Environment Specifications**
| Component | Development | Production |
|-----------|-------------|------------|
| **Frontend** | Next.js Dev Server | Vercel Edge Network |
| **Database** | Local JSON Files | Supabase PostgreSQL |
| **Authentication** | Mock API | Supabase Auth |
| **Payments** | Simulation | Live Processors |
| **Monitoring** | Console Logs | DataDog + Sentry |

---

## **⚙️ Environment Configuration**

### **Production Environment Variables**
```bash
# Core Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://app.bitagora.com
NEXT_PUBLIC_API_URL=https://api.bitagora.com

# Database
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/bitagora
SUPABASE_URL=https://project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=https://app.bitagora.com

# Payment Processors
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...

# Crypto Configuration
BITCOIN_NODE_URL=https://bitcoin-mainnet.com
LIGHTNING_MACAROON=your-lightning-macaroon
TRON_API_KEY=your-tron-grid-api-key

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
DATADOG_API_KEY=your-datadog-api-key
LOG_LEVEL=info

# Security
CORS_ORIGIN=https://app.bitagora.com,https://bitagora.com
CSP_REPORT_URI=https://bitagora.report-uri.com/r/d/csp/enforce
```

### **Environment Variable Security**
```typescript
// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_live_'),
  // ... other required variables
})

// Validate on startup
const env = envSchema.parse(process.env)
```

---

## **🔧 Build & Deployment Process**

### **Build Pipeline**
```yaml
# .github/workflows/deploy.yml
name: Production Deployment
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run test:integration
      - run: npm run lint
      - run: npm run type-check

  security:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm audit --audit-level moderate
      - run: npm run security-scan

  deploy:
    needs: [test, security]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### **Database Migration**
```typescript
// Migration strategy for production
const migrationPlan = {
  phase1: {
    description: 'Schema creation and initial data',
    scripts: ['001_create_tables.sql', '002_seed_data.sql'],
    rollback: ['002_rollback_seed.sql', '001_drop_tables.sql']
  },
  phase2: {
    description: 'Data migration from JSON to PostgreSQL',
    scripts: ['003_migrate_users.sql', '004_migrate_transactions.sql'],
    validation: 'validate_data_integrity.sql'
  }
}

// Migration execution
const executeMigration = async (): Promise<void> => {
  const client = new Client({ connectionString: DATABASE_URL })
  
  try {
    await client.connect()
    
    for (const phase of migrationPlan) {
      console.log(`Executing ${phase.description}...`)
      
      for (const script of phase.scripts) {
        await client.query(fs.readFileSync(script, 'utf8'))
      }
      
      if (phase.validation) {
        const result = await client.query(fs.readFileSync(phase.validation, 'utf8'))
        if (!result.rows[0].success) {
          throw new Error('Migration validation failed')
        }
      }
    }
  } finally {
    await client.end()
  }
}
```

---

## **🔒 Security Hardening**

### **Production Security Checklist**
- [ ] **HTTPS/TLS**: Full SSL/TLS encryption
- [ ] **CSP Headers**: Content Security Policy implemented
- [ ] **CORS**: Restrictive cross-origin policy
- [ ] **Rate Limiting**: API and authentication rate limits
- [ ] **Input Validation**: All inputs validated and sanitized
- [ ] **Authentication**: Secure session management
- [ ] **Crypto Validation**: Address validation enabled
- [ ] **Monitoring**: Security event logging
- [ ] **Backup**: Automated data backups
- [ ] **Secrets**: Environment variables secured

### **Security Headers Configuration**
```typescript
// Next.js security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com"
  }
]
```

### **WAF Configuration**
```yaml
# Cloudflare WAF rules
security_level: high
bot_fight_mode: true
browser_integrity_check: true

custom_rules:
  - name: "Block suspicious patterns"
    expression: '(http.request.uri.path contains "admin" and cf.threat_score > 5)'
    action: "block"
  
  - name: "Rate limit API endpoints"
    expression: '(http.request.uri.path matches "^/api/")'
    action: "rate_limit"
    rate_limit:
      requests_per_minute: 100
      action: "challenge"
```

---

## **📊 Database Setup**

### **Supabase Configuration**
```sql
-- Create database schema
CREATE SCHEMA IF NOT EXISTS bitagora;

-- Enable Row Level Security
ALTER TABLE bitagora.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bitagora.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE bitagora.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only see their own data" ON bitagora.users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Merchants can only see their own data" ON bitagora.merchants
  FOR ALL USING (auth.uid() = owner_id);

-- Create indexes for performance
CREATE INDEX idx_transactions_merchant_id ON bitagora.transactions(merchant_id);
CREATE INDEX idx_transactions_created_at ON bitagora.transactions(created_at);
CREATE INDEX idx_products_merchant_id ON bitagora.products(merchant_id);
```

### **Connection Pooling**
```typescript
// Database connection configuration
const dbConfig = {
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,                    // Maximum connections
  idleTimeoutMillis: 30000,   // 30 seconds
  connectionTimeoutMillis: 2000, // 2 seconds
}

// Connection pool setup
const pool = new Pool(dbConfig)

// Health check
const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}
```

---

## **💳 Payment Integration**

### **Stripe Production Setup**
```typescript
// Stripe configuration for production
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  appInfo: {
    name: 'BitAgora POS',
    version: '1.0.0',
    url: 'https://bitagora.com'
  }
})

// Webhook endpoint security
const validateStripeWebhook = (payload: string, signature: string): boolean => {
  try {
    stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    return true
  } catch (error) {
    console.error('Stripe webhook validation failed:', error)
    return false
  }
}
```

### **Crypto Node Setup**
```typescript
// Bitcoin node configuration
const bitcoinConfig = {
  network: 'mainnet',
  host: process.env.BITCOIN_NODE_URL,
  username: process.env.BITCOIN_RPC_USER,
  password: process.env.BITCOIN_RPC_PASSWORD,
  timeout: 30000
}

// Lightning node configuration
const lightningConfig = {
  socket: process.env.LIGHTNING_SOCKET,
  cert: process.env.LIGHTNING_CERT,
  macaroon: process.env.LIGHTNING_MACAROON
}
```

---

## **📈 Monitoring & Observability**

### **Application Monitoring**
```typescript
// DataDog integration
import { datadogRum } from '@datadog/browser-rum'

datadogRum.init({
  applicationId: process.env.NEXT_PUBLIC_DATADOG_APP_ID!,
  clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN!,
  site: 'datadoghq.com',
  service: 'bitagora-pos',
  env: 'production',
  version: '1.0.0',
  trackInteractions: true,
  trackResources: true,
  trackLongTasks: true
})

// Custom metrics
const trackBusinessMetric = (metric: string, value: number, tags?: string[]) => {
  datadogRum.addAction('business_metric', {
    metric,
    value,
    tags: tags?.join(',') || ''
  })
}
```

### **Health Check Endpoints**
```typescript
// Health check API
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: await checkDatabaseHealth(),
      redis: await checkRedisHealth(),
      stripe: await checkStripeHealth(),
      bitcoin: await checkBitcoinHealth()
    }
  }
  
  const isHealthy = Object.values(health.checks).every(check => check)
  
  return Response.json(health, {
    status: isHealthy ? 200 : 503
  })
}
```

### **Alerting Configuration**
```yaml
# DataDog alerts
alerts:
  - name: "High Error Rate"
    query: "avg(last_5m):avg:trace.web.request.errors{env:production,service:bitagora-pos}.as_rate() > 0.05"
    message: "Error rate is above 5% for BitAgora POS"
    
  - name: "Database Connection Issues"
    query: "avg(last_5m):avg:database.connections.failed{env:production} > 5"
    message: "Database connection failures detected"
    
  - name: "Payment Processing Failures"
    query: "sum(last_15m):increment(payment.failed{env:production}) > 10"
    message: "High payment failure rate detected"
```

---

## **🔄 Backup & Recovery**

### **Automated Backups**
```typescript
// Database backup configuration
const backupConfig = {
  schedule: '0 2 * * *',  // Daily at 2 AM UTC
  retention: 30,          // Keep 30 days
  encryption: true,       // Encrypt backups
  compression: true       // Compress backups
}

// Backup script
const performBackup = async (): Promise<void> => {
  const timestamp = new Date().toISOString().split('T')[0]
  const backupName = `bitagora-backup-${timestamp}`
  
  try {
    // Create database dump
    await exec(`pg_dump ${DATABASE_URL} | gzip > ${backupName}.sql.gz`)
    
    // Upload to secure storage
    await uploadToS3(backupName, `${backupName}.sql.gz`)
    
    // Verify backup integrity
    await verifyBackup(backupName)
    
    console.log(`Backup ${backupName} completed successfully`)
  } catch (error) {
    console.error('Backup failed:', error)
    await alerting.send('backup_failed', { error, timestamp })
  }
}
```

### **Disaster Recovery Plan**
1. **RTO (Recovery Time Objective)**: 2 hours
2. **RPO (Recovery Point Objective)**: 1 hour
3. **Backup Frequency**: Every 4 hours
4. **Failover**: Automatic with health checks
5. **Geographic**: Multi-region deployment

---

## **🚀 Deployment Checklist**

### **Pre-Deployment**
- [ ] All tests passing (unit, integration, E2E)
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Backup systems tested

### **Deployment**
- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Deploy to production
- [ ] Verify health checks
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Verify payment processing
- [ ] Check crypto address validation

### **Post-Deployment**
- [ ] Monitor system metrics for 24 hours
- [ ] Verify all payment methods working
- [ ] Check transaction processing
- [ ] Validate data integrity
- [ ] Test backup and recovery
- [ ] Update documentation
- [ ] Team notification
- [ ] Customer communication

---

## **📋 Maintenance**

### **Regular Maintenance Tasks**
| Task | Frequency | Owner |
|------|-----------|-------|
| Security updates | Weekly | DevOps |
| Database optimization | Monthly | DBA |
| Performance review | Monthly | Engineering |
| Backup verification | Weekly | Operations |
| SSL certificate renewal | Quarterly | DevOps |
| Dependency updates | Bi-weekly | Engineering |

### **Monitoring Dashboard**
```typescript
// Key metrics to monitor
const productionMetrics = {
  availability: {
    target: 99.9,
    alert: 99.5
  },
  responseTime: {
    target: 200,  // ms
    alert: 500
  },
  errorRate: {
    target: 0.1,  // %
    alert: 1.0
  },
  throughput: {
    target: 1000, // requests/minute
    alert: 100
  }
}
```

---

## **🔗 External Dependencies**

### **Third-Party Services**
| Service | Purpose | SLA | Fallback |
|---------|---------|-----|----------|
| Vercel | Frontend hosting | 99.99% | CloudFlare Pages |
| Supabase | Database & Auth | 99.9% | AWS RDS |
| Stripe | Payment processing | 99.95% | PayPal |
| DataDog | Monitoring | 99.9% | Grafana |
| Cloudflare | CDN & Security | 99.9% | AWS CloudFront |

### **API Rate Limits**
```typescript
// External API rate limits
const API_LIMITS = {
  stripe: 100,          // requests per second
  supabase: 500,        // requests per minute
  bitcoin: 10,          // requests per second
  lightning: 50         // requests per minute
}
```

---

*Last Updated: July 6, 2025*  
*Version: 1.0*  
*Classification: Production Guide* 