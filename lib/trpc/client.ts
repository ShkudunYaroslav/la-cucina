import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@/server/api/root'
import superjson from 'superjson'

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
})