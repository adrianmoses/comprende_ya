// src/routes/__root.tsx
/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import {
    Outlet,
    HeadContent,
    Scripts, createRootRouteWithContext,
} from '@tanstack/react-router'
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary'
import { NotFound } from '@/components/NotFound'
import type { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import appCss from '../styles.css?url'

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
      links: [{ rel: 'stylesheet', href: appCss}]
  }),
    errorComponent: (props) => {
      return (
          <RootDocument>
              <DefaultCatchBoundary {...props} />
          </RootDocument>
      )
    },
    notFoundComponent: () => <NotFound />,
    component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <header className="bg-blue-600 text-white p-6 shadow-lg">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold">ComprendeYa</h1>
                    <p className="text-blue-100">Aprende español con videos interactivos</p>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </body>
    </html>
  )
}
