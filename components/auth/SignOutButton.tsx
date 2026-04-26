"use client"

import { LogOut } from "lucide-react"
import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function SignOutButton() {
  const router = useRouter()

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

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-amber-100 hover:bg-red-700 hover:text-white transition-colors"
    >
      <LogOut size={20} />
      <span>Выйти</span>
    </button>
  )
}