import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-secondary/40 px-4 py-12">
      <div className="mx-auto w-full max-w-xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Megalithic Mapper</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue collaborating with researchers across the ancient world.
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
