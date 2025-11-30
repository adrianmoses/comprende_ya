// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})


function Home() {
    return (
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
            <div className="max-w-3xl text-center">
                <h1 className="text-4xl font-bold text-foreground sm:text-5xl md:text-6xl mb-6">
                    ComprendeYa
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    Improve your audio comprehension with interactive quizzes and shadowing exercises
                </p>
            </div>
        </div>
    )
}
