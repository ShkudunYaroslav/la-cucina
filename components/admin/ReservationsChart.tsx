"use client"

import { trpc } from "@/lib/trpc/react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format, subDays } from "date-fns"
import { ru } from "date-fns/locale"

export function ReservationsChart() {
  const { data: reservations } = trpc.reservation.getAll.useQuery()
  
  if (!reservations) return null

  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), i)
    const dateStr = format(date, "yyyy-MM-dd")
    const count = reservations.filter((r: any) => r.date === dateStr).length
    return {
      date: format(date, "dd.MM", { locale: ru }),
      count,
      fullDate: dateStr,
    }
  }).reverse()

  return (
    <div className="bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-800">
      <h3 className="text-lg font-medium text-white mb-4">Загруженность за 14 дней</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={last14Days}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
            <YAxis stroke="#71717a" fontSize={12} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Бронирований" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}