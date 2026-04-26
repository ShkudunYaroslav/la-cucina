import { router } from './trpc'
import { menuRouter } from './routers/menu'
import { authRouter } from './routers/auth'
import { reservationRouter } from './routers/reservation'
import { tableRouter } from './routers/table'
import { favoriteRouter } from './routers/favorite'
import { reviewRouter } from './routers/review'

export const appRouter = router({
  menu: menuRouter,
  auth: authRouter,
  reservation: reservationRouter,
  table: tableRouter,
  favorite: favoriteRouter,
  review: reviewRouter,
})

export type AppRouter = typeof appRouter