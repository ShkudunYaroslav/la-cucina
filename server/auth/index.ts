import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, username } from 'better-auth/plugins'
import { db } from '../db'
import * as schema from '../db/schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [
    admin({
      defaultRole: 'user',
      adminRole: 'admin',
    }),
    username(),
  ],
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        input: false,
        defaultValue: 'user',
      },
      phone: {
        type: 'string',
        required: false,
      },
    },
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60, // 30 дней
    updateAge: 24 * 60 * 60,      // обновлять каждый день
  },
  // Дополнительные настройки для куки
  cookies: {
    sessionCookie: {
      name: 'better-auth.session_token',
      options: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 дней
      },
    },
  },
})

export type Auth = typeof auth
export type Session = typeof auth.$Infer.Session