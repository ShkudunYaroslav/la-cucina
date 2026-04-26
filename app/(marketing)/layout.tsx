import Link from "next/link"
import { auth } from "@/server/auth"
import { headers } from "next/headers"
import { UserMenu } from "@/components/auth/UserMenu"
import { LogIn, UserPlus } from "lucide-react"

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList,
  })

  return (
    <>
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
        <nav className="container mx-auto h-16 flex items-center justify-between px-4">
          <Link 
            href="/" 
            className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600"
          >
            La Cucina
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/menu" className="text-zinc-300 hover:text-amber-400 transition font-medium">Меню</Link>
            <Link href="/reservation" className="text-zinc-300 hover:text-amber-400 transition font-medium">Бронирование</Link>
            
            {session ? (
              <UserMenu user={session.user} />
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/sign-in" className="flex items-center gap-1 px-4 py-2 text-zinc-300 hover:text-amber-400 transition font-medium">
                  <LogIn size={16} />Войти
                </Link>
                <Link href="/sign-up" className="flex items-center gap-1 px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-full hover:from-amber-500 hover:to-amber-400 transition shadow-md">
                  <UserPlus size={16} />Регистрация
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>
      {children}
    </>
  )
}