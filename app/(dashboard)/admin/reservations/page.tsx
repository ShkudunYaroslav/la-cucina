"use client"

import { trpc } from "@/lib/trpc/react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { toast } from "sonner"
import { Check, X, Clock, ShoppingCart, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { formatPrice } from "@/lib/utils"
import { ExportButton } from "@/components/admin/ExportButton"

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Ожидает", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  confirmed: { label: "Подтверждено", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  arrived: { label: "Гость прибыл", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  cancelled: { label: "Отменено", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  completed: { label: "Завершено", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
}

const getPlural = (count: number, one: string, few: string, many: string) => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

export default function AdminReservationsPage() {
  const { data: reservations, isLoading, refetch } = trpc.reservation.getAll.useQuery()
  
  const updateStatus = trpc.reservation.updateStatus.useMutation({
    onSuccess: () => {
      refetch()
      toast.success("Статус обновлён")
    },
  })

  const handleStatusChange = (id: string, status: string) => {
    updateStatus.mutate({ id, status: status as any })
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        <p className="text-zinc-400 mt-4">Загрузка...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif text-amber-400">Управление бронированиями</h1>
        <ExportButton />
      </div>

      <div className="bg-zinc-900 rounded-xl shadow-lg overflow-hidden border border-zinc-800">
        <table className="w-full">
          <thead className="bg-zinc-800 border-b border-zinc-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Гость</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Дата и время</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Столик</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Гостей</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Предзаказ</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Статус</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-zinc-300">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {reservations?.map((res: any) => (
              <ReservationRow
                key={res.id}
                reservation={res}
                onStatusChange={handleStatusChange}
              />
            ))}
          </tbody>
        </table>
        
        {reservations?.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            Нет бронирований
          </div>
        )}
      </div>
    </div>
  )
}

function ReservationRow({ reservation, onStatusChange }: any) {
  const [showPreOrder, setShowPreOrder] = useState(false)
  
  const { data: preOrderData } = trpc.reservation.getPreOrder.useQuery(
    { reservationId: reservation.id },
    { enabled: showPreOrder }
  )

  const hasPreOrder = preOrderData && preOrderData.items && preOrderData.items.length > 0
  const totalPrice = hasPreOrder 
    ? preOrderData.items.reduce((sum: number, item: any) => sum + parseFloat(item.menuItem.price) * item.quantity, 0)
    : 0
  const itemsWord = hasPreOrder ? getPlural(preOrderData.items.length, 'блюдо', 'блюда', 'блюд') : ''
  const guestWord = getPlural(reservation.guestCount, 'гость', 'гостя', 'гостей')

  return (
    <>
      <tr className="hover:bg-zinc-800/50 transition">
        <td className="px-4 py-3">
          <p className="font-medium text-white">{reservation.user?.name || "—"}</p>
          <p className="text-sm text-zinc-400">{reservation.user?.phone || reservation.user?.email || "—"}</p>
        </td>
        <td className="px-4 py-3">
          <p className="text-white">{format(new Date(reservation.date), "d MMM yyyy", { locale: ru })}</p>
          <p className="text-sm text-zinc-400">{reservation.time?.slice(0, 5)}</p>
        </td>
        <td className="px-4 py-3 text-white">
          Столик №{reservation.table?.number || "—"} ({reservation.table?.capacity || 0} мест)
        </td>
        <td className="px-4 py-3 text-white">{reservation.guestCount} {guestWord}</td>
        <td className="px-4 py-3">
          {hasPreOrder ? (
            <button 
              onClick={() => setShowPreOrder(!showPreOrder)}
              className="flex items-center gap-1 text-amber-500 hover:text-amber-400 text-sm"
            >
              <ShoppingCart size={14} />
              {preOrderData.items.length} {itemsWord}
              {showPreOrder ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          ) : (
            <span className="text-zinc-500 text-sm">—</span>
          )}
        </td>
        <td className="px-4 py-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusLabels[reservation.status]?.color}`}>
            {statusLabels[reservation.status]?.label}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex justify-end gap-1">
            {reservation.status === "pending" && (
              <>
                <button
                  onClick={() => onStatusChange(reservation.id, "confirmed")}
                  className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg transition"
                  title="Подтвердить"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => onStatusChange(reservation.id, "cancelled")}
                  className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition"
                  title="Отменить"
                >
                  <X size={18} />
                </button>
              </>
            )}
            {reservation.status === "confirmed" && (
              <button
                onClick={() => onStatusChange(reservation.id, "arrived")}
                className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition"
                title="Гость прибыл"
              >
                <Check size={18} />
              </button>
            )}
            {reservation.status === "arrived" && (
              <button
                onClick={() => onStatusChange(reservation.id, "completed")}
                className="p-2 text-purple-400 hover:bg-purple-900/30 rounded-lg transition"
                title="Завершить"
              >
                <Clock size={18} />
              </button>
            )}
          </div>
        </td>
      </tr>
      
      {showPreOrder && hasPreOrder && (
        <tr>
          <td colSpan={7} className="px-4 py-4 bg-zinc-800/30 border-t border-zinc-700">
            <div className="ml-8 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <h4 className="font-medium text-amber-400 mb-3 flex items-center gap-2">
                <ShoppingCart size={16} /> Предзаказ
              </h4>
              <div className="space-y-2 mb-3">
                {preOrderData.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-zinc-300">
                      {item.menuItem.name} × {item.quantity}
                      {item.notes && <span className="text-zinc-500 text-xs block">{item.notes}</span>}
                    </span>
                    <span className="text-amber-500">{formatPrice(parseFloat(item.menuItem.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              {preOrderData.specialNotes && (
                <div className="mb-3 p-2 bg-zinc-900 rounded text-sm">
                  <span className="text-zinc-400">Заметки: </span>
                  <span className="italic text-zinc-300">{preOrderData.specialNotes}</span>
                </div>
              )}
              <div className="border-t border-zinc-700 pt-2 flex justify-between font-medium">
                <span className="text-zinc-300">Итого:</span>
                <span className="text-amber-500">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}