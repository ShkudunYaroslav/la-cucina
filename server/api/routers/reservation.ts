import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { and, eq, inArray } from 'drizzle-orm'
import { protectedProcedure, adminProcedure, staffProcedure, router } from '../trpc'
import { reservations, tables, preOrders, preOrderItems, menuItems } from '@/server/db/schema'
import { reservationSchema } from '@/lib/validators/reservation'

const preOrderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().min(1),
  notes: z.string().optional(),
})

export const reservationRouter = router({
  getMyReservations: protectedProcedure.query(async ({ ctx }) => {
    const userReservations = await ctx.db
      .select()
      .from(reservations)
      .where(eq(reservations.userId, ctx.session.user.id))
      .leftJoin(tables, eq(reservations.tableId, tables.id))
      .orderBy(reservations.date, reservations.time)
    
    return userReservations.map(({ reservations: res, tables: table }) => ({ ...res, table }))
  }),

  getAll: adminProcedure.query(async ({ ctx }) => {
    const allReservations = await ctx.db
      .select()
      .from(reservations)
      .leftJoin(tables, eq(reservations.tableId, tables.id))
      .orderBy(reservations.date, reservations.time)
    
    const withUsers = await Promise.all(
      allReservations.map(async ({ reservations: res, tables: table }) => {
        const user = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, res.userId),
          columns: { id: true, name: true, email: true, phone: true },
        })
        return { ...res, table, user }
      })
    )
    return withUsers
  }),

  getTodayReservations: staffProcedure.query(async ({ ctx }) => {
    const today = new Date().toISOString().split('T')[0]
    const todayReservations = await ctx.db
      .select()
      .from(reservations)
      .where(and(eq(reservations.date, today), inArray(reservations.status, ['confirmed', 'arrived'])))
      .leftJoin(tables, eq(reservations.tableId, tables.id))
      .orderBy(reservations.time)
    
    const withUsers = await Promise.all(
      todayReservations.map(async ({ reservations: res, tables: table }) => {
        const user = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, res.userId),
          columns: { id: true, name: true, phone: true },
        })
        return { ...res, table, user }
      })
    )
    return withUsers
  }),

  create: protectedProcedure
    .input(reservationSchema)
    .mutation(async ({ ctx, input }) => {
      const [reservation] = await ctx.db
        .insert(reservations)
        .values({
          userId: ctx.session.user.id,
          tableId: input.tableId,
          date: input.date.toISOString().split('T')[0],
          time: input.time,
          duration: input.duration,
          guestCount: input.guestCount,
          specialRequests: input.specialRequests,
          status: 'pending',
        })
        .returning()
      return reservation
    }),

  createWithPreOrder: protectedProcedure
    .input(z.object({
      reservation: reservationSchema,
      preOrderItems: z.array(preOrderItemSchema).optional(),
      specialNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      console.log('📦 preOrderItems received:', input.preOrderItems?.length || 0)
      
      const [reservation] = await ctx.db
        .insert(reservations)
        .values({
          userId: ctx.session.user.id,
          tableId: input.reservation.tableId,
          date: input.reservation.date.toISOString().split('T')[0],
          time: input.reservation.time,
          duration: input.reservation.duration,
          guestCount: input.reservation.guestCount,
          specialRequests: input.reservation.specialRequests,
          status: 'pending',
        })
        .returning()

      console.log('✅ Reservation created:', reservation.id)

      if (input.preOrderItems && input.preOrderItems.length > 0) {
        console.log('📝 Creating preOrder...')
        const [preOrder] = await ctx.db
          .insert(preOrders)
          .values({
            reservationId: reservation.id,
            status: 'pending',
            specialNotes: input.specialNotes || null,
          })
          .returning()

        console.log('✅ PreOrder created:', preOrder.id)

        await ctx.db.insert(preOrderItems).values(
          input.preOrderItems.map((item) => ({
            preOrderId: preOrder.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            notes: item.notes || null,
          }))
        )
        console.log('✅ PreOrderItems added:', input.preOrderItems.length)
      }

      return reservation
    }),

  cancel: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(reservations)
        .set({ status: 'cancelled', updatedAt: new Date() })
        .where(and(eq(reservations.id, input.id), eq(reservations.userId, ctx.session.user.id)))
        .returning()
      if (!updated) throw new TRPCError({ code: 'NOT_FOUND' })
      return updated
    }),

  updateStatus: adminProcedure
    .input(z.object({ id: z.string().uuid(), status: z.enum(['pending', 'confirmed', 'arrived', 'cancelled', 'completed']) }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(reservations)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(reservations.id, input.id))
        .returning()
      if (!updated) throw new TRPCError({ code: 'NOT_FOUND' })
      return updated
    }),

  markArrived: staffProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(reservations)
        .set({ status: 'arrived', updatedAt: new Date() })
        .where(eq(reservations.id, input.id))
        .returning()
      if (!updated) throw new TRPCError({ code: 'NOT_FOUND' })
      return updated
    }),

  markCompleted: staffProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(reservations)
        .set({ status: 'completed', updatedAt: new Date() })
        .where(eq(reservations.id, input.id))
        .returning()
      if (!updated) throw new TRPCError({ code: 'NOT_FOUND' })
      return updated
    }),

  cancelByStaff: staffProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(reservations)
        .set({ status: 'cancelled', updatedAt: new Date() })
        .where(eq(reservations.id, input.id))
        .returning()
      if (!updated) throw new TRPCError({ code: 'NOT_FOUND' })
      return updated
    }),

  getPreOrder: staffProcedure
    .input(z.object({ reservationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const preOrder = await ctx.db.query.preOrders.findFirst({
          where: eq(preOrders.reservationId, input.reservationId),
        })
        if (!preOrder) return null
        
        const items = await ctx.db.query.preOrderItems.findMany({
          where: eq(preOrderItems.preOrderId, preOrder.id),
        })
        
        const itemsWithMenu = await Promise.all(
          items.map(async (item) => {
            const menuItem = await ctx.db.query.menuItems.findFirst({
              where: eq(menuItems.id, item.menuItemId),
            })
            return { ...item, menuItem }
          })
        )
        
        return { ...preOrder, items: itemsWithMenu }
      } catch (error) {
        console.error('❌ Error in getPreOrder:', error)
        return null
      }
    }),

  getMyPreOrder: protectedProcedure
    .input(z.object({ reservationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const reservation = await ctx.db.query.reservations.findFirst({
          where: and(
            eq(reservations.id, input.reservationId),
            eq(reservations.userId, ctx.session.user.id)
          ),
        })
        if (!reservation) return null
        
        const preOrder = await ctx.db.query.preOrders.findFirst({
          where: eq(preOrders.reservationId, input.reservationId),
        })
        if (!preOrder) return null
        
        const items = await ctx.db.query.preOrderItems.findMany({
          where: eq(preOrderItems.preOrderId, preOrder.id),
        })
        
        const itemsWithMenu = await Promise.all(
          items.map(async (item) => {
            const menuItem = await ctx.db.query.menuItems.findFirst({
              where: eq(menuItems.id, item.menuItemId),
            })
            return { ...item, menuItem }
          })
        )
        
        return { ...preOrder, items: itemsWithMenu }
      } catch (error) {
        console.error('❌ Error in getMyPreOrder:', error)
        return null
      }
    }),
})