import { createFileRoute, Link } from '@tanstack/react-router'
import ClerkHeader from '../integrations/clerk/header-user'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="min-h-screen">
      <div>
        <h1>Wish Weaver</h1>
        <div>
          <Link to="/dashboard">Dashboard</Link>
        </div>
        <div>
          <button>New list</button>
          <ClerkHeader />
        </div>
      </div>
    </div>
  )
}
