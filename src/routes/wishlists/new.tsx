import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth'

export const Route = createFileRoute('/wishlists/new')({
  component: NewWishlistPage,
})

function NewWishlistPage() {
  const { data } = authClient.useSession()
  const userId = data?.session?.userId
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    if (!title.trim()) {
      setError('Please enter a wishlist title')
      return
    }

    setLoading(true)
    setError('')

    try {
    } catch (err) {
      console.error('Failed to create wishlist:', err)
      setError('Failed to create wishlist. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate({ to: '/wishlists' })}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-8 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Wishlists
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Create a New Wishlist
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-gray-700 font-medium">
                Wishlist Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Christmas 2024, Birthday Gifts"
                className="mt-2"
                disabled={loading}
              />
            </div>

            <div>
              <Label
                htmlFor="description"
                className="text-gray-700 font-medium"
              >
                Description (Optional)
              </Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for this wishlist..."
                rows={4}
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={loading}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Wishlist'}
              </Button>
              <Button
                type="button"
                onClick={() => navigate({ to: '/wishlists' })}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
