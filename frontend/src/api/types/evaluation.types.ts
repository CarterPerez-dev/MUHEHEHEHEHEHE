// ===================
// © AngelaMos | 2026
// evaluation.types.ts
// ===================

import { z } from 'zod'

export const EVALUATION_CATEGORY = {
  OPEN_SOURCE: 'open_source',
  SELF_PROJECTS: 'self_projects',
  PRODUCTION: 'production',
  TECHNICAL_SKILLS: 'technical_skills',
} as const

export type EvaluationCategory =
  (typeof EVALUATION_CATEGORY)[keyof typeof EVALUATION_CATEGORY]

export const CATEGORY_MAX: Record<EvaluationCategory, number> = {
  open_source: 35,
  self_projects: 30,
  production: 25,
  technical_skills: 10,
} as const

export const CATEGORY_LABEL: Record<EvaluationCategory, string> = {
  open_source: 'Open Source',
  self_projects: 'Self Projects',
  production: 'Production',
  technical_skills: 'Technical Skills',
} as const

export const FINAL_SCORE_MAX = 120

const categoryScoreSchema = z.object({
  score: z.number(),
  max: z.number(),
  evidence: z.string(),
})

const evaluationScoresSchema = z.object({
  open_source: categoryScoreSchema,
  self_projects: categoryScoreSchema,
  production: categoryScoreSchema,
  technical_skills: categoryScoreSchema,
})

const bonusPointsSchema = z.object({
  total: z.number(),
  breakdown: z.string(),
})

const deductionsSchema = z.object({
  total: z.number(),
  reasons: z.string(),
})

export const evaluationReadSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  filename: z.string(),
  candidate_name: z.string().nullable(),
  status: z.string(),
  model_used: z.string(),
  final_score: z.number(),
  scores: evaluationScoresSchema,
  bonus_points: bonusPointsSchema,
  deductions: deductionsSchema,
  key_strengths: z.array(z.string()),
  areas_for_improvement: z.array(z.string()),
  github: z.unknown().nullable(),
})

export const evaluationSummarySchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  filename: z.string(),
  candidate_name: z.string().nullable(),
  status: z.string(),
  model_used: z.string(),
  final_score: z.number(),
})

export const evaluationListResponseSchema = z.object({
  items: z.array(evaluationSummarySchema),
  total: z.number(),
  page: z.number(),
  size: z.number(),
})

export type CategoryScore = z.infer<typeof categoryScoreSchema>
export type EvaluationScores = z.infer<typeof evaluationScoresSchema>
export type BonusPoints = z.infer<typeof bonusPointsSchema>
export type Deductions = z.infer<typeof deductionsSchema>
export type EvaluationRead = z.infer<typeof evaluationReadSchema>
export type EvaluationSummary = z.infer<typeof evaluationSummarySchema>
export type EvaluationListResponse = z.infer<typeof evaluationListResponseSchema>

export const isValidEvaluationRead = (data: unknown): data is EvaluationRead => {
  if (data === null || data === undefined) return false
  if (typeof data !== 'object') return false

  const result = evaluationReadSchema.safeParse(data)
  return result.success
}

export const isValidEvaluationList = (
  data: unknown
): data is EvaluationListResponse => {
  if (data === null || data === undefined) return false
  if (typeof data !== 'object') return false

  const result = evaluationListResponseSchema.safeParse(data)
  return result.success
}

export class EvaluationResponseError extends Error {
  readonly endpoint?: string

  constructor(message: string, endpoint?: string) {
    super(message)
    this.name = 'EvaluationResponseError'
    this.endpoint = endpoint
    Object.setPrototypeOf(this, EvaluationResponseError.prototype)
  }
}

export const EVALUATION_CONSTRAINTS = {
  MAX_FILE_BYTES: 10 * 1024 * 1024,
  ACCEPTED_MIME: 'application/pdf',
} as const

export const EVALUATION_ERROR_MESSAGES = {
  INVALID_EVALUATION_RESPONSE: 'Invalid evaluation data from server',
  INVALID_EVALUATION_LIST_RESPONSE: 'Invalid evaluation list from server',
  NOT_A_PDF: 'Only PDF files are accepted',
  FILE_TOO_LARGE: 'File exceeds the 10MB limit',
  RATE_LIMITED: 'Rate limit reached. Please wait a minute and try again.',
  FAILED_TO_CREATE: 'Failed to create evaluation',
  FAILED_TO_DELETE: 'Failed to delete evaluation',
} as const

export const EVALUATION_SUCCESS_MESSAGES = {
  CREATED: 'Evaluation complete',
  DELETED: 'Evaluation deleted',
} as const

export type EvaluationErrorMessage =
  (typeof EVALUATION_ERROR_MESSAGES)[keyof typeof EVALUATION_ERROR_MESSAGES]
export type EvaluationSuccessMessage =
  (typeof EVALUATION_SUCCESS_MESSAGES)[keyof typeof EVALUATION_SUCCESS_MESSAGES]
