#!/usr/bin/env node
// Documentation Organization Script
// Moves scattered .md files into proper Docs structure

const fs = require('fs')
const path = require('path')

console.log('📁 BitAgora Documentation Organization Script\n')

// Define file organization mapping
const organizationPlan = {
  // Session documentation from root to Development/Sessions
  'BUTTON_SIZING_AND_TITLE_REMOVAL.md': 'Docs/03-Development/Sessions/BUTTON_SIZING_AND_TITLE_REMOVAL.md',
  'CHECKOUT_PANEL_IMPROVEMENTS.md': 'Docs/03-Development/Sessions/CHECKOUT_PANEL_IMPROVEMENTS.md',
  'CODE_REVIEW_FIXES.md': 'Docs/03-Development/Sessions/CODE_REVIEW_FIXES.md',
  'PAYMENT_LAYOUT_OPTIMIZATIONS.md': 'Docs/03-Development/Sessions/PAYMENT_LAYOUT_OPTIMIZATIONS.md',
  'PAYMENT_MODAL_OPTIMIZATION.md': 'Docs/03-Development/Sessions/PAYMENT_MODAL_OPTIMIZATION.md',
  'PAYMENT_SUMMARY_IMPROVEMENTS.md': 'Docs/03-Development/Sessions/PAYMENT_SUMMARY_IMPROVEMENTS.md',
  'PAYMENT_SUMMARY_LAYOUT_IMPROVEMENTS.md': 'Docs/03-Development/Sessions/PAYMENT_SUMMARY_LAYOUT_IMPROVEMENTS.md',
  'SCROLLING_FIX_DOCUMENTATION.md': 'Docs/03-Development/Sessions/SCROLLING_FIX_DOCUMENTATION.md',
  'UI_IMPROVEMENTS_SUMMARY.md': 'Docs/03-Development/Sessions/UI_IMPROVEMENTS_SUMMARY.md',
  
  // Testing documentation to Testing folder
  'TEST_TRANSACTION_FLOW.md': 'Docs/03-Development/Testing/TEST_TRANSACTION_FLOW.md'
}

// Create necessary directories
const dirsToCreate = [
  'Docs/03-Development/Sessions',
  'Docs/03-Development/Testing'
]

console.log('📂 Creating directory structure...')
dirsToCreate.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`   ✅ Created: ${dir}`)
  } else {
    console.log(`   ✅ Exists: ${dir}`)
  }
})

console.log('\n📋 Moving files to organized structure...')
Object.entries(organizationPlan).forEach(([source, destination]) => {
  if (fs.existsSync(source)) {
    try {
      fs.renameSync(source, destination)
      console.log(`   ✅ Moved: ${source} → ${destination}`)
    } catch (error) {
      console.log(`   ❌ Error moving ${source}: ${error.message}`)
    }
  } else {
    console.log(`   ⚠️  Not found: ${source}`)
  }
})

console.log('\n📊 Current Documentation Structure:')
console.log('Docs/')
console.log('├── 01-Project-Overview/')
console.log('│   ├── Master Development Roadmap.md')
console.log('│   ├── Master README.md')
console.log('│   └── README.md')
console.log('├── 02-Protocols/')
console.log('│   ├── Responsive Design System.md')
console.log('│   └── Security Guidelines.md')
console.log('├── 03-Development/')
console.log('│   ├── Best-Practices/')
console.log('│   │   ├── bitagora-implementation-guide.md')
console.log('│   │   ├── bitagora-specific-patterns.md')
console.log('│   │   ├── React Component Best Practices.md')
console.log('│   │   └── Testing Strategy.md')
console.log('│   ├── Feature-Management-System.md')
console.log('│   ├── Page Audits/')
console.log('│   │   ├── Payment Settings Improvement Plan.md')
console.log('│   │   └── Payment Settings Risk Audit.md')
console.log('│   ├── Payment Settings Phase 1 Completion.md')
console.log('│   ├── Payment Settings Phase 2 Completion.md')
console.log('│   ├── Roadmaps/')
console.log('│   │   ├── Crypto QR Implementation Plan.md')
console.log('│   │   └── Master Development Roadmap.md')
console.log('│   ├── Sessions/ (NEW)')
console.log('│   │   ├── BUTTON_SIZING_AND_TITLE_REMOVAL.md')
console.log('│   │   ├── CHECKOUT_PANEL_IMPROVEMENTS.md')
console.log('│   │   ├── CODE_REVIEW_FIXES.md')
console.log('│   │   ├── PAYMENT_LAYOUT_OPTIMIZATIONS.md')
console.log('│   │   ├── PAYMENT_MODAL_OPTIMIZATION.md')
console.log('│   │   ├── PAYMENT_SUMMARY_IMPROVEMENTS.md')
console.log('│   │   ├── PAYMENT_SUMMARY_LAYOUT_IMPROVEMENTS.md')
console.log('│   │   ├── SCROLLING_FIX_DOCUMENTATION.md')
console.log('│   │   └── UI_IMPROVEMENTS_SUMMARY.md')
console.log('│   └── Testing/ (NEW)')
console.log('│       └── TEST_TRANSACTION_FLOW.md')
console.log('├── 04-Architecture/')
console.log('│   ├── System Architecture.md')
console.log('│   └── UI-UX-Layout-Guidelines.md')
console.log('├── 06-Crypto-Payments/')
console.log('│   ├── Address Validation.md')
console.log('│   ├── Payments-Integration-Plan.md')
console.log('│   ├── Strik+Lightning-Integration-Documentation.md')
console.log('│   ├── Strik+Lightning-Integration-Overview.md')
console.log('│   ├── USDT Integration.md')
console.log('│   └── USDT-Payment-Overview.md')
console.log('├── 08-API-Reference/')
console.log('│   └── API Documentation.md')
console.log('├── 09-Deployment/')
console.log('│   └── Production Deployment Guide.md')
console.log('└── Archive/')
console.log('    ├── DOCUMENTATION_IMPROVEMENT_PLAN.md')
console.log('    ├── PROPOSED_STRUCTURE.md')
console.log('    └── REDUNDANCY_ANALYSIS.md')

console.log('\n✅ Documentation organization complete!')
console.log('   └── All development session notes organized into Sessions/')
console.log('   └── Testing documentation organized into Testing/')
console.log('   └── Root directory cleaned up')
console.log('   └── Existing Docs structure preserved')

console.log('\n🎯 Benefits of this organization:')
console.log('├── 📁 Clean root directory')
console.log('├── 📋 Organized development sessions')
console.log('├── 🧪 Dedicated testing documentation')
console.log('├── 🔍 Easy to find specific documentation')
console.log('└── 📚 Professional documentation structure')
console.log() 