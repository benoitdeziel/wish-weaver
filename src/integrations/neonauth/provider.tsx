import { authClient } from '@/lib/auth'
import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react'

export default function AppAuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NeonAuthUIProvider authClient={authClient}>{children}</NeonAuthUIProvider>
  )
}
