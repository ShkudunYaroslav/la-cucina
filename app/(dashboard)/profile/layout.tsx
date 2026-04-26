"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Calendar, Heart } from "lucide-react"

const tabs = [
  { href: "/profile/info", label: "Личные данные", icon: User },
  { href: "/profile/reservations", label: "Мои бронирования", icon: Calendar },
  { href: "/profile/favorites", label: "Избранное", icon: Heart },
]

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div>
      <h1 className="text-3xl font-serif text-amber-900 mb-6">Мой профиль</h1>
      
      {/* Tabs */}
      <div className="border-b border-zinc-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
                  isActive
                    ? "border-amber-600 text-amber-900 font-medium"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {children}
    </div>
  )
}