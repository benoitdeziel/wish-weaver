import { createFileRoute, Link } from '@tanstack/react-router'

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
          <button>Login</button>
          <button>New list</button>
        </div>
      </div>
    </div>
  )
}
