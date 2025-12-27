import { describe, it, expect } from 'vitest'
import { security } from '@/lib/security'

describe('Security Utilities', () => {
  describe('sanitizeInput', () => {
    it('removes javascript: protocol', () => {
      const input = 'javascript:alert(1)'
      expect(security.sanitizeInput(input)).toBe('alert(1)')
    })

    it('removes event handlers', () => {
      const input = '<div onclick="alert(1)">test</div>'
      expect(security.sanitizeInput(input)).not.toContain('onclick=')
    })

    it('preserves normal text', () => {
      const input = 'Hello World 123'
      expect(security.sanitizeInput(input)).toBe('Hello World 123')
    })
  })

  describe('isValidDiscordId', () => {
    it('validates correct Discord ID', () => {
      expect(security.isValidDiscordId('123456789012345678')).toBe(true)
    })

    it('rejects invalid Discord ID', () => {
      expect(security.isValidDiscordId('invalid')).toBe(false)
      expect(security.isValidDiscordId('123')).toBe(false)
    })
  })

  describe('isValidUrl', () => {
    it('validates HTTPS URLs', () => {
      expect(security.isValidUrl('https://example.com')).toBe(true)
    })

    it('validates HTTP URLs', () => {
      expect(security.isValidUrl('http://example.com')).toBe(true)
    })

    it('rejects invalid URLs', () => {
      expect(security.isValidUrl('not-a-url')).toBe(false)
      expect(security.isValidUrl('ftp://example.com')).toBe(false)
    })
  })

  describe('generateToken', () => {
    it('generates 64 character hex token', () => {
      const token = security.generateToken()
      expect(token).toHaveLength(64)
      expect(/^[a-f0-9]+$/.test(token)).toBe(true)
    })

    it('generates unique tokens', () => {
      const token1 = security.generateToken()
      const token2 = security.generateToken()
      expect(token1).not.toBe(token2)
    })
  })
})
