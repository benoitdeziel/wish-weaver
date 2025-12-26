import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { authClient } from '@/lib/auth'

export const Route = createFileRoute('/wishlists/')({
  component: WishlistsPage,
})

function WishlistsPage() {
  const { data } = authClient.useSession()

  const userId = data?.session?.userId

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p className="text-gray-600">
            You need to be signed in to view your wishlists
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              My Wishlists
            </h1>
            <p className="text-gray-600">
              Create and share wishlists with friends and family
            </p>
          </div>
          <Link
            to="/wishlists/new"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Plus size={20} />
            New Wishlist
          </Link>
        </div>
      </div>
    </div>
  )
}
