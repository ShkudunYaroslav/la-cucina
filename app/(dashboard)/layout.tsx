import { auth } from "@/server/auth"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Calendar, 
  User, 
  Coffee,
  Users,
  ChefHat,
  Menu
} from "lucide-react"
import { SignOutButton } from "@/components/auth/SignOutButton"
import { CartSidebar } from "@/components/cart/CartSidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session) {
    redirect("/sign-in")
  }

  const user = session.user
  const isAdmin = user.role === "admin"
  const isWaiter = user.role === "waiter"
  const isStaff = isAdmin || isWaiter

  const navItems = [
    { href: "/profile", label: "Профиль", icon: User, show: true },
    { href: "/profile/reservations", label: "Мои брони", icon: Calendar, show: !isStaff },
    { href: "/profile/favorites", label: "Избранное", icon: Coffee, show: !isStaff },
    { href: "/menu", label: "Меню ресторана", icon: Menu, show: true },
    { href: "/reservation", label: "Забронировать", icon: Calendar, show: !isStaff },
    { href: "/admin", label: "Админ-панель", icon: LayoutDashboard, show: isAdmin },
    { href: "/admin/reservations", label: "Бронирования", icon: Calendar, show: isAdmin },
    { href: "/admin/menu", label: "Управление меню", icon: ChefHat, show: isAdmin },
    { href: "/waiter", label: "Панель официанта", icon: Users, show: isWaiter },
  ]

  return (
    <div className="flex h-screen bg-zinc-950">
      <aside className="w-72 bg-gradient-to-b from-amber-950 to-amber-900 text-white flex flex-col border-r border-amber-800">
        <div className="p-6 border-b border-amber-800">
          <Link href="/" className="block">
            <h2 className="text-2xl font-serif font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
              La Cucina
            </h2>
            <p className="text-amber-400 text-sm mt-1">Итальянский ресторан</p>
          </Link>
        </div>

        <div className="p-6 border-b border-amber-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 flex items-center justify-center text-xl font-bold">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-sm text-amber-400 truncate">{user.email}</p>
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                isAdmin ? 'bg-red-600' : isWaiter ? 'bg-blue-600' : 'bg-green-600'
              }`}>
                {isAdmin ? 'Администратор' : isWaiter ? 'Официант' : 'Клиент'}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.filter(item => item.show).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-amber-100 hover:bg-amber-800 hover:text-white transition-colors"
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-amber-800">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-amber-100 hover:bg-amber-800 hover:text-white transition-colors mb-2"
          >
            <Coffee size={20} />
            <span>На главную</span>
          </Link>
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 bg-zinc-900">
        {children}
      </main>
      
      <CartSidebar />
    </div>
  )
}