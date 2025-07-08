// Mock Storage Implementation
// Enhanced Frontend-First Mock Database Strategy
// Uses localStorage on client-side and file-based storage on server-side for persistence

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// Server-side file-based storage (persists across restarts)
const DATA_DIR = join(process.cwd(), '.bitagora-data')

// Ensure data directory exists
if (typeof window === 'undefined') {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true })
    }
  } catch (error) {
    console.warn('Could not create data directory:', error)
  }
}

export class MockStorage {
  private useMock: boolean
  private isServer: boolean

  constructor() {
    this.useMock = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false'
    this.isServer = typeof window === 'undefined'
  }

  setItem(key: string, value: string): void {
    if (this.isServer) {
      // Server-side: Use file-based storage (persists across restarts)
      try {
        const filePath = join(DATA_DIR, `${key}.json`)
        writeFileSync(filePath, value, 'utf8')
      } catch (error) {
        console.warn(`Failed to save ${key}:`, error)
      }
    } else {
      // Client-side: Use localStorage (as per strategy)
      localStorage.setItem(key, value)
    }
  }

  getItem(key: string): string | null {
    if (this.isServer) {
      // Server-side: Get from file-based storage
      try {
        const filePath = join(DATA_DIR, `${key}.json`)
        if (existsSync(filePath)) {
          return readFileSync(filePath, 'utf8')
        }
        return null
      } catch (error) {
        console.warn(`Failed to read ${key}:`, error)
        return null
      }
    } else {
      // Client-side: Get from localStorage (as per strategy)
      return localStorage.getItem(key)
    }
  }

  removeItem(key: string): void {
    if (this.isServer) {
      // Server-side: Remove file
      try {
        const filePath = join(DATA_DIR, `${key}.json`)
        if (existsSync(filePath)) {
          const fs = require('fs')
          fs.unlinkSync(filePath)
        }
      } catch (error) {
        console.warn(`Failed to delete ${key}:`, error)
      }
    } else {
      // Client-side: Remove from localStorage (as per strategy)
      localStorage.removeItem(key)
    }
  }

  clear(): void {
    if (this.isServer) {
      // Server-side: Clear bitagora files only
      try {
        const fs = require('fs')
        const files = fs.readdirSync(DATA_DIR)
        files.filter((file: string) => file.startsWith('bitagora_') && file.endsWith('.json'))
             .forEach((file: string) => {
               fs.unlinkSync(join(DATA_DIR, file))
             })
      } catch (error) {
        console.warn('Failed to clear server storage:', error)
      }
    } else {
      // Client-side: Clear localStorage (as per strategy)
      const keys = Object.keys(localStorage).filter(key => key.startsWith('bitagora_'))
      keys.forEach(key => localStorage.removeItem(key))
    }
  }

  // User-specific storage methods
  setUserItem(userId: string, key: string, value: string): void {
    const userKey = `bitagora_user_${userId}_${key}`
    this.setItem(userKey, value)
  }

  getUserItem(userId: string, key: string): string | null {
    const userKey = `bitagora_user_${userId}_${key}`
    return this.getItem(userKey)
  }

  removeUserItem(userId: string, key: string): void {
    const userKey = `bitagora_user_${userId}_${key}`
    this.removeItem(userKey)
  }
}

// Create singleton instance
export const mockStorage = new MockStorage() 