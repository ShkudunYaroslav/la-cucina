import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'
import { favorites, menuItems } from '@/server/db/schema'
import { and, eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

export const favoriteRouter = router({
  getMyFavorites: protectedProcedure.query(async ({ ctx }) => {
    const userFavorites = await ctx.db
      .select({
        id: favorites.id,
        menuItem: menuItems,
      })
      .from(favorites)
      .leftJoin(menuItems, eq(favorites.menuItemId, menuItems.id))
      .where(eq(favorites.userId, ctx.session.user.id))
    
    return userFavorites.map(f => f.menuItem).filter(Boolean)
  }),

  getMyFavoriteIds: protectedProcedure.query(async ({ ctx }) => {
    const userFavorites = await ctx.db
      .select({ menuItemId: favorites.menuItemId })
      .from(favorites)
      .where(eq(favorites.userId, ctx.session.user.id))
    
    return userFavorites.map(f => f.menuItemId)
  }),

  add: protectedProcedure
    .input(z.object({ menuItemId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const [favorite] = await ctx.db
          .insert(favorites)
          .values({
            userId: ctx.session.user.id,
            menuItemId: input.menuItemId,
          })
          .onConflictDoNothing()
          .returning()
        return favorite
      } catch (error) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Уже в избранном' })
      }
    }),

  remove: protectedProcedure
    .input(z.object({ menuItemId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(favorites)
        .where(
          and(
            eq(favorites.userId, ctx.session.user.id),
            eq(favorites.menuItemId, input.menuItemId)
          )
        )
        .returning()
      return deleted
    }),
})