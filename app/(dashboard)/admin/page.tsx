"use client"

import { trpc } from "@/lib/trpc/react"
import Link from "next/link"
import { Calendar, Menu, Users, Clock, AlertCircle } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { ReservationsChart } from "@/components/admin/ReservationsChart"

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const { data: reservations } = trpc.reservation.getAll.useQuery()
  const { data: menuItems } = trpc.menu.getAll.useQuery()
  
  const pendingCount = reservations?.filter((r: any) => r.status === "pending").length || 0
  const todayCount = reservations?.filter((r: any) => r.date === new Date().toISOString().split('T')[0]).length || 0

  const stats = [
    { label: "Всего броней", value: reservations?.length || 0, icon: Calendar, color: "bg-blue-500" },
    { label: "Ожидают подтверждения", value: pendingCount, icon: Clock, color: "bg-yellow-500" },
    { label: "На сегодня", value: todayCount, icon: Users, color: "bg-green-500" },
    { label: "Блюд в меню", value: menuItems?.length || 0, icon: Menu, color: "bg-amber-500" },
  ]

  const myOldReservations = reservations?.filter((r: any) => r.user?.email === session?.user?.email) || []

  return (
    <div>
      <h1 className="text-3xl font-serif text-amber-400 mb-6">Панель администратора</h1>
      
      {myOldReservations.length > 0 && (
        <div className="mb-6 p-4 bg-amber-900/20 border border-amber-600/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-amber-400">У вас есть бронирования, созданные до получения роли администратора</p>
            <p className="text-sm text-amber-300/80 mt-1">
              Вы можете управлять ими как администратор. Если бронирования не отображаются, 
              <button onClick={() => window.location.href = "/sign-in"} className="underline font-medium mx-1">выйдите</button> 
              и войдите заново для обновления сессии.
            </p>
          </div>
        </div>
      )}
      
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-zinc-900 rounded-xl p-5 shadow-lg border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                <stat.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* График загруженности */}
      <div className="mb-8">
        <ReservationsChart />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/admin/reservations" className="block p-6 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 hover:border-amber-600/50 transition group">
          <h3 className="text-lg font-medium mb-2 text-white group-hover:text-amber-400 transition">📋 Управление бронированиями</h3>
          <p className="text-zinc-400 text-sm">Просмотр, подтверждение и отмена броней</p>
        </Link>
        <Link href="/admin/menu" className="block p-6 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 hover:border-amber-600/50 transition group">
          <h3 className="text-lg font-medium mb-2 text-white group-hover:text-amber-400 transition">🍝 Управление меню</h3>
          <p className="text-zinc-400 text-sm">Добавление, редактирование и удаление блюд</p>
        </Link>
      </div>
    </div>
  )
}