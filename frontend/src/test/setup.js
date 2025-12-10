import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Silencia console.error durante os testes
const originalError = console.error
const originalConsole = { ...console }

beforeAll(() => {
  console.error = (...args) => {
    // Permite erros específicos para testes
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Erro ao buscar produtos:')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

// Restaura console.error após os testes
afterAll(() => {
  console.error = originalError
})

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
  // Restaura todos os métodos do console
  Object.keys(originalConsole).forEach(key => {
    console[key] = originalConsole[key]
  })
})
