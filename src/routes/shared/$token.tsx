import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '@clerk/clerk-react'
import { Share2, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getWishlistByShareToken, updateWishlistItem } from '../api/wishlists'
import type { Wishlist, WishlistItem } from '@/db-collections'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/shared/$token')({
  component: SharedWishlistPage,
})

function SharedWishlistPage() {
  const { token } = Route.useParams()
  const { userId } = useAuth()
  const [wishlist, setWishlist] = useState<
    (Wishlist & { items: WishlistItem[] }) | null
  >(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [markingItem, setMarkingItem] = useState<number | null>(null)

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true)
      try {
        const data = await getWishlistByShareToken({ shareToken: token })
        setWishlist(data)
      } catch (err) {
        console.error('Failed to load wishlist:', err)
        setError('Wishlist not found or has been deleted')
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [token])

  const handleTogglePurchased = async (item: WishlistItem) => {
    if (!userId || markingItem === item.id) return

    setMarkingItem(item.id)
    try {
      const updated = await updateWishlistItem({
        userId,
        itemId: item.id,
        is_purchased: !item.is_purchased,
        purchased_by: !item.is_purchased ? userId : undefined,
      })

      if (updated && wishlist) {
        setWishlist({
          ...wishlist,
          items: wishlist.items.map((i) => (i.id === item.id ? updated : i)),
        })
      }
    } catch (error) {
      console.error('Failed to update item:', error)
      alert('Failed to update item. You may not have permission.')
    } finally {
      setMarkingItem(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error || !wishlist) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {error || 'Wishlist not found'}
          </h1>
          <p className="text-gray-600 mb-6">
            The wishlist you're looking for doesn't exist or has been deleted.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const totalItems = wishlist.items.length
  const purchasedCount = wishlist.items.filter((i) => i.is_purchased).length
  const totalPrice = wishlist.items.reduce((sum, i) => sum + (i.price || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {wishlist.title}
                </h1>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  <Share2 size={14} />
                  Shared
                </span>
              </div>

              {wishlist.description && (
                <p className="text-gray-600 mb-4">{wishlist.description}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-gray-50 p-6 rounded-lg">
            <div>
              <p className="text-gray-600 text-sm">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Claimed</p>
              <p className="text-2xl font-bold text-green-600">
                {purchasedCount}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalPrice.toFixed(2)}
              </p>
            </div>
          </div>

          {!userId && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                Sign in to mark items as claimed on this wishlist.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Items</h2>
          {wishlist.items.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600">No items in this wishlist yet</p>
            </div>
          ) : (
            wishlist.items.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-lg shadow-md p-6 transition-all ${
                  item.is_purchased ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {userId && (
                    <input
                      type="checkbox"
                      checked={item.is_purchased}
                      onChange={() => handleTogglePurchased(item)}
                      disabled={markingItem === item.id}
                      className="mt-2 w-5 h-5 text-green-600 rounded cursor-pointer disabled:opacity-50"
                      aria-label={`Mark "${item.title}" as purchased`}
                    />
                  )}

                  <div className="flex-1">
                    <h3
                      className={`text-lg font-semibold ${
                        item.is_purchased
                          ? 'line-through text-gray-500'
                          : 'text-gray-900'
                      }`}
                    >
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-gray-600 mt-1">{item.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                      {item.price && (
                        <span className="font-medium text-gray-700">
                          ${item.price.toFixed(2)} {item.currency}
                        </span>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 underline"
                        >
                          View Product
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {item.is_purchased && (
                        <span className="text-green-600 font-medium">
                          ✓ Claimed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
