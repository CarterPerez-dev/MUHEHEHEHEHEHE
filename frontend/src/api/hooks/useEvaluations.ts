// ===================
// © AngelaMos | 2026
// useEvaluations.ts
// ===================

import {
  type UseMutationResult,
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  EVALUATION_ERROR_MESSAGES,
  EVALUATION_SUCCESS_MESSAGES,
  type EvaluationListResponse,
  type EvaluationRead,
  EvaluationResponseError,
  isValidEvaluationList,
  isValidEvaluationRead,
} from '@/api/types'
import { API_ENDPOINTS, QUERY_KEYS } from '@/config'
import { ApiError, ApiErrorCode, apiClient, QUERY_STRATEGIES } from '@/core/api'

const CREATE_TIMEOUT_MS = 180000

export const evaluationQueries = {
  all: () => QUERY_KEYS.EVALUATIONS.ALL,
  list: (page: number, size: number) => QUERY_KEYS.EVALUATIONS.LIST(page, size),
  byId: (id: string) => QUERY_KEYS.EVALUATIONS.BY_ID(id),
} as const

const fetchEvaluations = async (
  page: number,
  size: number
): Promise<EvaluationListResponse> => {
  const response = await apiClient.get<unknown>(API_ENDPOINTS.EVALUATIONS.BASE, {
    params: { page, size },
  })
  const data: unknown = response.data

  if (!isValidEvaluationList(data)) {
    throw new EvaluationResponseError(
      EVALUATION_ERROR_MESSAGES.INVALID_EVALUATION_LIST_RESPONSE,
      API_ENDPOINTS.EVALUATIONS.BASE
    )
  }

  return data
}

export const useEvaluations = (
  page: number,
  size: number
): UseQueryResult<EvaluationListResponse, Error> => {
  return useQuery({
    queryKey: evaluationQueries.list(page, size),
    queryFn: () => fetchEvaluations(page, size),
    ...QUERY_STRATEGIES.standard,
  })
}

const fetchEvaluation = async (id: string): Promise<EvaluationRead> => {
  const response = await apiClient.get<unknown>(
    API_ENDPOINTS.EVALUATIONS.BY_ID(id)
  )
  const data: unknown = response.data

  if (!isValidEvaluationRead(data)) {
    throw new EvaluationResponseError(
      EVALUATION_ERROR_MESSAGES.INVALID_EVALUATION_RESPONSE,
      API_ENDPOINTS.EVALUATIONS.BY_ID(id)
    )
  }

  return data
}

export const useEvaluation = (
  id: string
): UseQueryResult<EvaluationRead, Error> => {
  return useQuery({
    queryKey: evaluationQueries.byId(id),
    queryFn: () => fetchEvaluation(id),
    enabled: id.length > 0,
    ...QUERY_STRATEGIES.standard,
  })
}

const performCreateEvaluation = async (file: File): Promise<EvaluationRead> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post<unknown>(
    API_ENDPOINTS.EVALUATIONS.BASE,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: CREATE_TIMEOUT_MS,
    }
  )
  const data: unknown = response.data

  if (!isValidEvaluationRead(data)) {
    throw new EvaluationResponseError(
      EVALUATION_ERROR_MESSAGES.INVALID_EVALUATION_RESPONSE,
      API_ENDPOINTS.EVALUATIONS.BASE
    )
  }

  return data
}

const resolveCreateError = (error: Error): string => {
  if (error instanceof ApiError && error.code === ApiErrorCode.RATE_LIMITED) {
    return EVALUATION_ERROR_MESSAGES.RATE_LIMITED
  }
  if (error instanceof EvaluationResponseError) {
    return error.message
  }
  if (error instanceof ApiError) {
    return error.getUserMessage()
  }
  return EVALUATION_ERROR_MESSAGES.FAILED_TO_CREATE
}

export const useCreateEvaluation = (): UseMutationResult<
  EvaluationRead,
  Error,
  File
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: performCreateEvaluation,
    onSuccess: (): void => {
      void queryClient.invalidateQueries({
        queryKey: evaluationQueries.all(),
      })
      toast.success(EVALUATION_SUCCESS_MESSAGES.CREATED)
    },
    onError: (error: Error): void => {
      toast.error(resolveCreateError(error))
    },
  })
}

const performDeleteEvaluation = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.EVALUATIONS.BY_ID(id))
}

export const useDeleteEvaluation = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: performDeleteEvaluation,
    onSuccess: (): void => {
      void queryClient.invalidateQueries({
        queryKey: evaluationQueries.all(),
      })
      toast.success(EVALUATION_SUCCESS_MESSAGES.DELETED)
    },
    onError: (error: Error): void => {
      const message =
        error instanceof ApiError
          ? error.getUserMessage()
          : EVALUATION_ERROR_MESSAGES.FAILED_TO_DELETE
      toast.error(message)
    },
  })
}
