"use client"

import { FloorPlan } from "@/components/reservation/FloorPlan"
import { ReservationForm } from "@/components/reservation/ReservationForm"
import { useState, Suspense } from "react"
import { trpc } from "@/lib/trpc/react"
import { useSession } from "@/lib/auth-client"
import Link from "next/link"
import { UserMenu } from "@/components/auth/UserMenu"
import { UserPlus, LogIn } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { CartSidebar } from "@/components/cart/CartSidebar"

function ReservationContent() {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const { data: tables } = trpc.table.getAll.useQuery()
  const selectedTable = tables?.find((t) => t.id === selectedTableId)

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
        <div className="container mx-auto h-16 flex items-center justify-between px-4">
          <Link href="/" className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
            La Cucina
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/menu" className="text-zinc-300 hover:text-amber-400 transition">Меню</Link>
            <Link href="/reservation" className="text-amber-400 font-medium">Бронирование</Link>
            {session ? <UserMenu user={session.user} /> : (
              <div className="flex items-center gap-3">
                <Link href="/sign-in" className="flex items-center gap-1 px-4 py-2 border border-zinc-600 text-zinc-300 rounded-full hover:bg-zinc-800 transition">
                  <LogIn size={16} />Войти
                </Link>
                <Link href="/sign-up" className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-full hover:from-amber-500 hover:to-amber-400 transition">
                  <UserPlus size={16} />Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-8 px-4">
        {!session ? (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="bg-zinc-900 rounded-2xl p-12 shadow-xl border border-zinc-800">
              <div className="text-6xl mb-6">🍽️</div>
              <h1 className="text-3xl font-serif text-amber-400 mb-4">Бронирование столика</h1>
              <p className="text-zinc-300 mb-8 text-lg">Для бронирования необходимо войти в аккаунт или зарегистрироваться</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sign-in" className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-amber-400 transition flex items-center justify-center gap-2">
                  <LogIn size={18} />Войти
                </Link>
                <Link href="/sign-up" className="px-6 py-3 border-2 border-amber-600 text-amber-500 rounded-lg hover:bg-amber-600/20 transition flex items-center justify-center gap-2">
                  <UserPlus size={18} />Зарегистрироваться
                </Link>
              </div>
              <p className="text-zinc-500 text-sm mt-6">Регистрация займёт меньше минуты</p>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-serif text-center mb-2 text-white">Бронирование столика</h1>
            <p className="text-center text-zinc-400 mb-8">Выберите столик на схеме зала и заполните форму</p>
            
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <FloorPlan onSelectTable={setSelectedTableId} />
              </div>
              <div className="lg:col-span-1">
                {selectedTable ? (
                  <ReservationForm
                    tableId={selectedTable.id}
                    tableNumber={selectedTable.number}
                    capacity={selectedTable.capacity}
                    onSuccess={() => setSelectedTableId(null)}
                  />
                ) : (
                  <div className="bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-800">
                    <p className="text-center text-zinc-400">Выберите столик на схеме, чтобы продолжить</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      <CartSidebar />
    </div>
  )
}

export default function ReservationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Загрузка...</div>}>
      <ReservationContent />
    </Suspense>
  )
}