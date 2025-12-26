import { createFileRoute, Link } from '@tanstack/react-router'
import HeaderUser from '../integrations/neonauth/header-user'

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
          <Link to="/wishlists">Wishlists</Link>
        </div>
        <div>
          <button>New list</button>
        </div>
        <HeaderUser />
      </div>
    </div>
  )
}
