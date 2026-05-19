import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'emailRequired').email('emailInvalid'),
  password: z.string().min(1, 'passwordRequired').min(8, 'passwordMin'),
  rememberMe: z.boolean().optional(),
})

export const registerSchema = z.object({
  email: z.string().min(1, 'emailRequired').email('emailInvalid'),
  password: z
    .string()
    .min(1, 'passwordRequired')
    .min(8, 'passwordMin')
    .regex(/[0-9]/, 'passwordNumber'),
  agreeTerms: z.boolean().refine(v => v === true, 'agreeTermsRequired'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'emailRequired').email('emailInvalid'),
})

export const verifyOTPSchema = z.object({
  code: z
    .string()
    .min(1, 'codeRequired')
    .length(6, 'codeLength')
    .regex(/^\d{6}$/, 'codeLength'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
export type VerifyOTPFormValues = z.infer<typeof verifyOTPSchema>
