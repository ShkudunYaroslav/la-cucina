import { publicProcedure, protectedProcedure, router } from '../trpc'
import { updateProfileSchema } from '@/lib/validators/auth'
import { users } from '@/server/db/schema'
import { eq } from 'drizzle-orm'

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session
  }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
      columns: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    })
    return user
  }),

  updateProfile: protectedProcedure
  .input(updateProfileSchema)
  .mutation(async ({ ctx, input }) => {
    const [updated] = await ctx.db
      .update(users)
      .set({
        name: input.name,
        phone: input.phone,
        updatedAt: new Date(),
      })
      .where(eq(users.id, ctx.session.user.id))
      .returning()
    return updated
  }),
})