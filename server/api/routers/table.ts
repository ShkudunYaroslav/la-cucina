import { publicProcedure, router } from '../trpc'
import { tables } from '@/server/db/schema'
import { eq } from 'drizzle-orm'

export const tableRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.tables.findMany({
      where: eq(tables.isActive, true),
      orderBy: (t, { asc }) => asc(t.number),
    })
  }),
})