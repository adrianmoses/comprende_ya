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
import appCss from '../styles/global.css?url'
import {Toaster} from "@/components/ui/sonner";

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
    <html className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="min-h-screen bg-background">
            <nav className="border-b border-border">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <a href="/" className="text-xl font-semibold text-foreground">
                            ComprendeYa
                        </a>
                        <div className="flex items-center gap-6">
                            <a href="/videos" className="text-foreground hover:text-muted-foreground transition-colors">
                                Videos
                            </a>
                            <a href="/add-video" className="text-foreground hover:text-muted-foreground transition-colors">
                                Add Video
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
        <Toaster />
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </body>
    </html>
  )
}
