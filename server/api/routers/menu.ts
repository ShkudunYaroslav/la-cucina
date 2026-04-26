import { z } from 'zod'
import { publicProcedure, adminProcedure, router } from '../trpc'
import { menuItems } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

const menuItemSchema = z.object({
  name: z.string().min(2, "Название должно содержать минимум 2 символа"),
  description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Некорректная цена"),
  category: z.enum(['antipasti', 'primi', 'secondi', 'contorni', 'dolci', 'bevande']),
  imageUrl: z.string().url().optional().nullable(),
  ingredients: z.array(z.string()).min(1, "Добавьте хотя бы один ингредиент"),
  allergens: z.array(z.string()).optional().nullable(),
  isAvailable: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  preparationTime: z.number().min(0).optional().nullable(),
})

export const menuRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.menuItems.findMany({
      orderBy: (items, { asc }) => [asc(items.category), asc(items.name)],
    })
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.menuItems.findFirst({
        where: eq(menuItems.id, input.id),
      })
    }),

  // Админские процедуры
  create: adminProcedure
    .input(menuItemSchema)
    .mutation(async ({ ctx, input }) => {
      const [item] = await ctx.db
        .insert(menuItems)
        .values({
          name: input.name,
          description: input.description,
          price: input.price,
          category: input.category,
          imageUrl: input.imageUrl,
          ingredients: input.ingredients,
          allergens: input.allergens || [],
          isAvailable: input.isAvailable,
          isPopular: input.isPopular,
          preparationTime: input.preparationTime,
        })
        .returning()
      return item
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: menuItemSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(menuItems)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(menuItems.id, input.id))
        .returning()
      
      if (!updated) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Блюдо не найдено' })
      }
      
      return updated
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(menuItems)
        .where(eq(menuItems.id, input.id))
        .returning()
      
      if (!deleted) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Блюдо не найдено' })
      }
      
      return deleted
    }),

  toggleAvailability: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.query.menuItems.findFirst({
        where: eq(menuItems.id, input.id),
      })
      
      if (!item) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Блюдо не найдено' })
      }
      
      const [updated] = await ctx.db
        .update(menuItems)
        .set({
          isAvailable: !item.isAvailable,
          updatedAt: new Date(),
        })
        .where(eq(menuItems.id, input.id))
        .returning()
      
      return updated
    }),
})