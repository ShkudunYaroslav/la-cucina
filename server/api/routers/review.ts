import { z } from 'zod'
import { protectedProcedure, publicProcedure, adminProcedure, router } from '../trpc'
import { reviews, users } from '@/server/db/schema'
import { eq, desc } from 'drizzle-orm'

export const reviewRouter = router({
  getPublished: publicProcedure.query(async ({ ctx }) => {
    const publishedReviews = await ctx.db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        user: {
          name: users.name,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.isPublished, true))
      .orderBy(desc(reviews.createdAt))
      .limit(10)
    
    return publishedReviews
  }),

  getAll: adminProcedure.query(async ({ ctx }) => {
    const allReviews = await ctx.db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        isPublished: reviews.isPublished,
        createdAt: reviews.createdAt,
        user: {
          name: users.name,
          email: users.email,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .orderBy(desc(reviews.createdAt))
    
    return allReviews
  }),

  create: protectedProcedure
    .input(z.object({
      rating: z.number().min(1).max(5),
      comment: z.string().min(5, "Минимум 5 символов").max(500),
      reservationId: z.string().uuid().optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [review] = await ctx.db
        .insert(reviews)
        .values({
          userId: ctx.session.user.id,
          rating: input.rating,
          comment: input.comment,
          reservationId: input.reservationId || null,
          isPublished: true,
        })
        .returning()
      return review
    }),

  togglePublish: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.db.query.reviews.findFirst({
        where: eq(reviews.id, input.id),
      })
      if (!review) throw new Error('Отзыв не найден')
      
      const [updated] = await ctx.db
        .update(reviews)
        .set({ isPublished: !review.isPublished })
        .where(eq(reviews.id, input.id))
        .returning()
      return updated
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(reviews).where(eq(reviews.id, input.id))
      return { success: true }
    }),
})