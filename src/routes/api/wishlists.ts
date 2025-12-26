import { createServerFn } from '@tanstack/react-start'
import { getClient } from '@/db'
import type { Wishlist, WishlistItem } from '@/db-collections'
import crypto from 'crypto'

// Helper to generate share token
function generateShareToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// GET all wishlists for a user
export const getUserWishlists = createServerFn({
  method: 'GET',
})
  .inputValidator((d: { userId: string }) => d)
  .handler(async ({ data }) => {
    const client = await getClient()
    if (!client) return undefined

    const result = await client.query<Wishlist>(
      `SELECT * FROM wishlists WHERE user_id = $1 ORDER BY created_at DESC`,
      [data.userId],
    )
    return result as Wishlist[]
  })

// GET a single wishlist with items
export const getWishlistWithItems = createServerFn({
  method: 'GET',
})
  .inputValidator((d: { wishlistId: number; userId?: string }) => d)
  .handler(async ({ data }) => {
    const client = await getClient()
    if (!client) return undefined

    const wishlistResult = await client.query<Wishlist>(
      `SELECT * FROM wishlists WHERE id = $1`,
      [data.wishlistId],
    )

    const wishlist = wishlistResult[0]
    if (!wishlist) return undefined

    // Check permission if userId is provided
    if (
      data.userId &&
      wishlist.user_id !== data.userId &&
      !wishlist.is_public
    ) {
      return undefined
    }

    const itemsResult = await client.query<WishlistItem>(
      `SELECT * FROM wishlist_items WHERE wishlist_id = $1 ORDER BY created_at DESC`,
      [data.wishlistId],
    )

    return {
      ...wishlist,
      items: itemsResult as WishlistItem[],
    }
  })

// GET wishlist by share token
export const getWishlistByShareToken = createServerFn({
  method: 'GET',
})
  .inputValidator((d: { shareToken: string }) => d)
  .handler(async ({ data }) => {
    const client = await getClient()
    if (!client) return undefined

    const wishlistResult = await client.query<Wishlist>(
      `SELECT * FROM wishlists WHERE share_token = $1`,
      [data.shareToken],
    )

    const wishlist = wishlistResult[0]
    if (!wishlist) return undefined

    const itemsResult = await client.query<WishlistItem>(
      `SELECT * FROM wishlist_items WHERE wishlist_id = $1 ORDER BY created_at DESC`,
      [wishlist.id],
    )

    return {
      ...wishlist,
      items: itemsResult as WishlistItem[],
    }
  })

// CREATE a new wishlist
export const createWishlist = createServerFn({
  method: 'POST',
})
  .inputValidator(
    (d: { userId: string; title: string; description?: string }) => d,
  )
  .handler(async ({ data }) => {
    const client = await getClient()
    if (!client) return undefined

    const shareToken = generateShareToken()

    const result = await client.query<Wishlist>(
      `INSERT INTO wishlists (user_id, title, description, share_token, is_public)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.userId, data.title, data.description || null, shareToken, false],
    )

    return result[0]
  })

// UPDATE a wishlist
export const updateWishlist = createServerFn({
  method: 'PUT',
})
  .inputValidator(
    (d: {
      userId: string
      wishlistId: number
      title?: string
      description?: string
      is_public?: boolean
    }) => d,
  )
  .handler(async ({ data }) => {
    const client = await getClient()
    if (!client) return undefined

    // Verify ownership
    const wishlistResult = await client.query<Wishlist>(
      `SELECT * FROM wishlists WHERE id = $1`,
      [data.wishlistId],
    )

    if (!wishlistResult[0] || wishlistResult[0].user_id !== data.userId) {
      throw new Error('Unauthorized')
    }

    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (data.title !== undefined) {
      updates.push(`title = $${paramCount++}`)
      values.push(data.title)
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`)
      values.push(data.description)
    }
    if (data.is_public !== undefined) {
      updates.push(`is_public = $${paramCount++}`)
      values.push(data.is_public)
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(data.wishlistId)

    const result = await client.query<Wishlist>(
      `UPDATE wishlists SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values,
    )

    return result[0]
  })

// DELETE a wishlist
export const deleteWishlist = createServerFn({
  method: 'DELETE',
})
  .inputValidator((d: { userId: string; wishlistId: number }) => d)
  .handler(async ({ data }) => {
    const client = await getClient()
    if (!client) return undefined

    // Verify ownership
    const wishlistResult = await client.query<Wishlist>(
      `SELECT * FROM wishlists WHERE id = $1`,
      [data.wishlistId],
    )

    if (!wishlistResult[0] || wishlistResult[0].user_id !== data.userId) {
      throw new Error('Unauthorized')
    }

    await client.query(`DELETE FROM wishlists WHERE id = $1`, [data.wishlistId])

    return { success: true }
  })

// CREATE a new wishlist item
export const createWishlistItem = createServerFn({
  method: 'POST',
})
  .inputValidator(
    (d: {
      userId: string
      wishlistId: number
      title: string
      description?: string
      url?: string
      image_url?: string
      price?: number
      currency?: string
    }) => d,
  )
  .handler(async ({ data }) => {
    const client = await getClient()
    if (!client) return undefined

    // Verify ownership of wishlist
    const wishlistResult = await client.query<Wishlist>(
      `SELECT * FROM wishlists WHERE id = $1`,
      [data.wishlistId],
    )

    if (!wishlistResult[0] || wishlistResult[0].user_id !== data.userId) {
      throw new Error('Unauthorized')
    }

    const result = await client.query<WishlistItem>(
      `INSERT INTO wishlist_items (wishlist_id, title, description, url, image_url, price, currency)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.wishlistId,
        data.title,
        data.description || null,
        data.url || null,
        data.image_url || null,
        data.price || null,
        data.currency || 'USD',
      ],
    )

    return result[0]
  })

// UPDATE a wishlist item
export const updateWishlistItem = createServerFn({
  method: 'PUT',
})
  .inputValidator(
    (d: {
      userId: string
      itemId: number
      title?: string
      description?: string
      url?: string
      image_url?: string
      price?: number
      is_purchased?: boolean
      purchased_by?: string
    }) => d,
  )
  .handler(async ({ data }) => {
    const client = await getClient()
    if (!client) return undefined

    // Verify ownership through wishlist
    const itemResult = await client.query<WishlistItem>(
      `SELECT wi.*, w.user_id FROM wishlist_items wi
       JOIN wishlists w ON wi.wishlist_id = w.id
       WHERE wi.id = $1`,
      [data.itemId],
    )

    if (!itemResult[0] || itemResult[0].user_id !== data.userId) {
      throw new Error('Unauthorized')
    }

    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (data.title !== undefined) {
      updates.push(`title = $${paramCount++}`)
      values.push(data.title)
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`)
      values.push(data.description)
    }
    if (data.url !== undefined) {
      updates.push(`url = $${paramCount++}`)
      values.push(data.url)
    }
    if (data.image_url !== undefined) {
      updates.push(`image_url = $${paramCount++}`)
      values.push(data.image_url)
    }
    if (data.price !== undefined) {
      updates.push(`price = $${paramCount++}`)
      values.push(data.price)
    }
    if (data.is_purchased !== undefined) {
      updates.push(`is_purchased = $${paramCount++}`)
      values.push(data.is_purchased)
      if (data.is_purchased) {
        updates.push(`purchased_by = $${paramCount++}`)
        values.push(data.purchased_by || null)
        updates.push(`purchased_at = CURRENT_TIMESTAMP`)
      }
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(data.itemId)

    const result = await client.query<WishlistItem>(
      `UPDATE wishlist_items SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values,
    )

    return result[0]
  })

// DELETE a wishlist item
export const deleteWishlistItem = createServerFn({
  method: 'DELETE',
})
  .inputValidator((d: { userId: string; itemId: number }) => d)
  .handler(async ({ data }) => {
    const client = await getClient()
    if (!client) return undefined

    // Verify ownership through wishlist
    const itemResult = await client.query<WishlistItem>(
      `SELECT wi.*, w.user_id FROM wishlist_items wi
       JOIN wishlists w ON wi.wishlist_id = w.id
       WHERE wi.id = $1`,
      [data.itemId],
    )

    if (!itemResult[0] || itemResult[0].user_id !== data.userId) {
      throw new Error('Unauthorized')
    }

    await client.query(`DELETE FROM wishlist_items WHERE id = $1`, [
      data.itemId,
    ])

    return { success: true }
  })
