import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Plus, Copy, Check, Trash2, Edit2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Wishlist, WishlistItem } from '@/db-collections'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth'

export const Route = createFileRoute('/wishlists/$id')({
  component: WishlistDetailPage,
})

function WishlistDetailPage() {
  const { id } = Route.useParams()
  const { data } = authClient.useSession()
  const userId = data?.session?.userId
  const navigate = useNavigate()
  const [wishlist, setWishlist] = useState<
    (Wishlist & { items: WishlistItem[] }) | null
  >(null)
  const [loading, setLoading] = useState(true)
  const [editingTitle, setEditingTitle] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [showAddItem, setShowAddItem] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)
  const [itemForm, setItemForm] = useState({
    title: '',
    description: '',
    url: '',
    price: '',
  })

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true)

      setLoading(false)
    }

    fetchWishlist()
  }, [id, userId])

  const handleUpdateTitle = async () => {
    if (!wishlist || !userId || !newTitle.trim()) return
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!wishlist || !userId || !itemForm.title.trim()) return
  }

  const handleDeleteItem = async (itemId: number) => {
    if (!userId || !confirm('Delete this item?')) return
  }

  const handleTogglePurchased = async (item: WishlistItem) => {
    if (!userId) return
  }

  const copyShareLink = () => {
    if (wishlist?.share_token) {
      const link = `${window.location.origin}/shared/${wishlist.share_token}`
      navigator.clipboard.writeText(link)
      setCopiedToken(true)
      setTimeout(() => setCopiedToken(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!wishlist || !userId || wishlist.user_id !== userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Wishlist not found</h1>
          <Button
            onClick={() => navigate({ to: '/wishlists' })}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Back to Wishlists
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate({ to: '/wishlists' })}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-8 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Wishlists
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              {editingTitle ? (
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="text-2xl font-bold"
                  />
                  <Button
                    onClick={handleUpdateTitle}
                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingTitle(false)
                      setNewTitle(wishlist.title)
                    }}
                    className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {wishlist.title}
                  </h1>
                  <button
                    onClick={() => setEditingTitle(true)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
              )}

              {wishlist.description && (
                <p className="text-gray-600 mb-4">{wishlist.description}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={copyShareLink}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {copiedToken ? (
                <>
                  <Check size={18} />
                  Link Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy Share Link
                </>
              )}
            </button>
            <Button
              onClick={() => setShowAddItem(!showAddItem)}
              className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Plus size={18} />
              Add Item
            </Button>
          </div>
        </div>

        {showAddItem && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Add New Item
            </h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <Label htmlFor="item-title" className="text-gray-700">
                  Item Title *
                </Label>
                <Input
                  id="item-title"
                  value={itemForm.title}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, title: e.target.value })
                  }
                  placeholder="What item do you want?"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="item-description" className="text-gray-700">
                  Description
                </Label>
                <textarea
                  id="item-description"
                  value={itemForm.description}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, description: e.target.value })
                  }
                  placeholder="Details about this item..."
                  rows={3}
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item-url" className="text-gray-700">
                    Product URL
                  </Label>
                  <Input
                    id="item-url"
                    value={itemForm.url}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, url: e.target.value })
                    }
                    placeholder="https://example.com"
                    type="url"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="item-price" className="text-gray-700">
                    Price (optional)
                  </Label>
                  <Input
                    id="item-price"
                    value={itemForm.price}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, price: e.target.value })
                    }
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Add Item
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowAddItem(false)
                    setItemForm({
                      title: '',
                      description: '',
                      url: '',
                      price: '',
                    })
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Items</h2>
          {wishlist.items.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600 mb-4">No items added yet</p>
              <Button
                onClick={() => setShowAddItem(true)}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Add First Item
              </Button>
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
                  <input
                    type="checkbox"
                    checked={item.is_purchased}
                    onChange={() => handleTogglePurchased(item)}
                    className="mt-2 w-5 h-5 text-green-600 rounded cursor-pointer"
                    aria-label={`Mark "${item.title}" as purchased`}
                  />

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

                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
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
                          className="text-indigo-600 hover:text-indigo-700 underline"
                        >
                          View Product
                        </a>
                      )}
                      {item.is_purchased && (
                        <span className="text-green-600 font-medium">
                          ✓ Purchased
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    aria-label="Delete item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
