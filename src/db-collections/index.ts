import {
  createCollection,
  localOnlyCollectionOptions,
} from '@tanstack/react-db'
import { z } from 'zod'

const MessageSchema = z.object({
  id: z.number(),
  text: z.string(),
  user: z.string(),
})

export type Message = z.infer<typeof MessageSchema>

export const messagesCollection = createCollection(
  localOnlyCollectionOptions({
    getKey: (message) => message.id,
    schema: MessageSchema,
  }),
)

// Wishlist Models
export const WishlistSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  share_token: z.string().nullable().optional(),
  is_public: z.boolean().default(false),
})

export type Wishlist = z.infer<typeof WishlistSchema>

export const WishlistItemSchema = z.object({
  id: z.number(),
  wishlist_id: z.number(),
  title: z.string(),
  description: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  price: z.number().nullable().optional(),
  currency: z.string().default('USD'),
  is_purchased: z.boolean().default(false),
  purchased_by: z.string().nullable().optional(),
  purchased_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type WishlistItem = z.infer<typeof WishlistItemSchema>
