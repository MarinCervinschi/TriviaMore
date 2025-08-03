// Re-export all validation schemas from a central location
export * from './auth'

// Common validation utilities
import { z } from 'zod'
export { z }

// Common validation patterns
export const idSchema = z.string().cuid("ID non valido")
export const emailSchema = z.string().email("Email non valida")
export const passwordSchema = z.string().min(6, "La password deve essere di almeno 6 caratteri")
export const usernameSchema = z.string().min(3, "Lo username deve essere di almeno 3 caratteri")
export const nameSchema = z.string().min(2, "Il nome deve essere di almeno 2 caratteri")
