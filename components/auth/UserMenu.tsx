"use client"

import Link from "next/link"
import { User, LogOut, Heart, Calendar } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface UserMenuProps {
  user: {
    name: string
    email: string
    role?: string
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Вы вышли из аккаунта")
      router.push("/")
      router.refresh()
    } catch (error) {
      toast.error("Ошибка при выходе")
    }
  }

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-zinc-800 transition"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-white flex items-center justify-center text-sm font-medium">
          {getInitials(user.name)}
        </div>
        <span className="text-sm font-medium text-zinc-300 hidden sm:inline">
          {user.name.split(" ")[0]}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-zinc-900 rounded-lg shadow-xl border border-zinc-700 py-2 z-50">
          <div className="px-4 py-2 border-b border-zinc-800">
            <p className="font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-zinc-400 truncate">{user.email}</p>
          </div>
          
          <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition">
            <User size={18} /><span>Профиль</span>
          </Link>
          
          <Link href="/profile/reservations" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition">
            <Calendar size={18} /><span>Мои брони</span>
          </Link>
          
          <Link href="/profile/favorites" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition">
            <Heart size={18} /><span>Избранное</span>
          </Link>
          
          {user.role === "admin" && (
            <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition border-t border-zinc-800 mt-1 pt-1">
              <span>👑 Панель управления</span>
            </Link>
          )}
          
          {user.role === "waiter" && (
            <Link href="/waiter" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition border-t border-zinc-800 mt-1 pt-1">
              <span>🍽️ Панель официанта</span>
            </Link>
          )}
          
          <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:bg-red-900/30 hover:text-red-300 transition border-t border-zinc-800 mt-1">
            <LogOut size={18} /><span>Выйти</span>
          </button>
        </div>
      )}
    </div>
  )
}