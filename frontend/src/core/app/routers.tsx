// ===================
// © AngelaMos | 2026
// routers.tsx
// ===================

import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import { UserRole } from '@/api/types'
import { ROUTES } from '@/config'
import { ProtectedRoute } from './protected-route'
import { Shell } from './shell'

const routes: RouteObject[] = [
  {
    path: ROUTES.HOME,
    lazy: () => import('@/pages/landing'),
  },
  {
    path: ROUTES.LOGIN,
    lazy: () => import('@/pages/login'),
  },
  {
    path: ROUTES.REGISTER,
    lazy: () => import('@/pages/register'),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Shell />,
        children: [
          {
            path: ROUTES.DASHBOARD,
            element: <Navigate to={ROUTES.EVALUATE} replace />,
          },
          {
            path: ROUTES.EVALUATE,
            lazy: () => import('@/pages/evaluate'),
          },
          {
            path: ROUTES.HISTORY,
            lazy: () => import('@/pages/history'),
          },
          {
            path: '/evaluations/:id',
            lazy: () => import('@/pages/result'),
          },
          {
            path: ROUTES.SETTINGS,
            lazy: () => import('@/pages/settings'),
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={[UserRole.ADMIN]} />,
    children: [
      {
        element: <Shell />,
        children: [
          {
            path: ROUTES.ADMIN.USERS,
            lazy: () => import('@/pages/admin'),
          },
        ],
      },
    ],
  },
  {
    path: ROUTES.UNAUTHORIZED,
    lazy: () => import('@/pages/landing'),
  },
  {
    path: '*',
    lazy: () => import('@/pages/landing'),
  },
]

export const router = createBrowserRouter(routes)
