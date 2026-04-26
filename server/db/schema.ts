import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  decimal,
  boolean,
  pgEnum,
  date,
  time,
  json,
  unique,
} from 'drizzle-orm/pg-core'

// ========== ENUMS ==========
export const roleEnum = pgEnum('role', ['user', 'admin', 'waiter'])
export const reservationStatusEnum = pgEnum('reservation_status', [
  'pending',
  'confirmed',
  'arrived',
  'cancelled',
  'completed',
])
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'preparing',
  'ready',
  'served',
  'cancelled',
])
export const menuCategoryEnum = pgEnum('menu_category', [
  'antipasti',
  'primi',
  'secondi',
  'contorni',
  'dolci',
  'bevande',
])

// ========== USERS ==========
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  phone: text('phone'),
  role: roleEnum('role').notNull().default('user'),
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ========== SESSIONS ==========
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ========== ACCOUNTS ==========
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ========== VERIFICATIONS ==========
export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ========== MENU ITEMS ==========
export const menuItems = pgTable('menu_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  category: menuCategoryEnum('category').notNull(),
  imageUrl: text('image_url'),
  ingredients: text('ingredients').array(),
  allergens: text('allergens').array(),
  isAvailable: boolean('is_available').default(true).notNull(),
  isPopular: boolean('is_popular').default(false),
  preparationTime: integer('preparation_time'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ========== TABLES ==========
export const tables = pgTable('tables', {
  id: uuid('id').primaryKey().defaultRandom(),
  number: integer('number').notNull().unique(),
  capacity: integer('capacity').notNull(),
  location: json('location').$type<{ x: number; y: number }>().notNull(),
  shape: text('shape').notNull().default('circle'),
  width: integer('width'),
  height: integer('height'),
  section: text('section').default('main'),
  rotation: integer('rotation').default(0),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ========== RESERVATIONS ==========
export const reservations = pgTable('reservations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tableId: uuid('table_id')
    .notNull()
    .references(() => tables.id),
  date: date('date').notNull(),
  time: time('time').notNull(),
  duration: integer('duration').notNull().default(120),
  guestCount: integer('guest_count').notNull(),
  specialRequests: text('special_requests'),
  status: reservationStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ========== PRE-ORDERS ==========
export const preOrders = pgTable('pre_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  reservationId: uuid('reservation_id')
    .notNull()
    .references(() => reservations.id, { onDelete: 'cascade' }),
  status: orderStatusEnum('status').default('pending').notNull(),
  specialNotes: text('special_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const preOrderItems = pgTable('pre_order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  preOrderId: uuid('pre_order_id')
    .notNull()
    .references(() => preOrders.id, { onDelete: 'cascade' }),
  menuItemId: uuid('menu_item_id')
    .notNull()
    .references(() => menuItems.id),
  quantity: integer('quantity').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ========== ORDERS ==========
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  tableId: uuid('table_id')
    .notNull()
    .references(() => tables.id),
  waiterId: text('waiter_id').references(() => users.id),
  status: orderStatusEnum('status').default('pending').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }),
  isPaid: boolean('is_paid').default(false),
  paymentMethod: text('payment_method'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: uuid('menu_item_id')
    .notNull()
    .references(() => menuItems.id),
  quantity: integer('quantity').notNull(),
  notes: text('notes'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ========== FAVORITES ==========
export const favorites = pgTable('favorites', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  menuItemId: uuid('menu_item_id')
    .notNull()
    .references(() => menuItems.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  uniqueFavorite: unique().on(t.userId, t.menuItemId),
}))

// ========== REVIEWS ==========
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  reservationId: uuid('reservation_id').references(() => reservations.id),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  isPublished: boolean('is_published').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ========== TYPE EXPORTS ==========
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type MenuItem = typeof menuItems.$inferSelect
export type Table = typeof tables.$inferSelect
export type Reservation = typeof reservations.$inferSelect
export type Order = typeof orders.$inferSelect
export type Favorite = typeof favorites.$inferSelect
export type Review = typeof reviews.$inferSelect