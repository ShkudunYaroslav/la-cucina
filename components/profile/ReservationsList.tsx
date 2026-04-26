"use client"

import { trpc } from "@/lib/trpc/react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { toast } from "sonner"
import { useState } from "react"
import { formatPrice } from "@/lib/utils"
import { ShoppingCart, ChevronDown, ChevronUp } from "lucide-react"

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Ожидает подтверждения", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
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

export function ReservationsList() {
  const utils = trpc.useUtils()
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  const { data: reservations, isLoading, refetch } = trpc.reservation.getMyReservations.useQuery()
  
  const cancelMutation = trpc.reservation.cancel.useMutation({
    onSuccess: () => {
      toast.success("Бронирование отменено")
      refetch()
      utils.reservation.getMyReservations.invalidate()
    },
    onError: (error: any) => toast.error(error.message || "Ошибка при отмене"),
    onSettled: () => setCancellingId(null),
  })

  const handleCancel = (id: string) => {
    if (confirm("Вы уверены, что хотите отменить бронирование?")) {
      setCancellingId(id)
      cancelMutation.mutate({ id })
    }
  }

  if (isLoading) {
    return <div className="text-center py-8"><p className="text-zinc-400">Загрузка бронирований...</p></div>
  }

  if (!reservations?.length) {
    return (
      <div className="text-center py-8 bg-zinc-800/50 rounded-xl border border-zinc-700">
        <p className="text-zinc-400 mb-4">У вас пока нет бронирований</p>
        <a href="/reservation" className="inline-block px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-amber-400">
          Забронировать столик
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation: any) => {
        const status = statusLabels[reservation.status] || statusLabels.pending
        const isExpanded = expandedId === reservation.id
        
        return (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            status={status}
            isExpanded={isExpanded}
            onToggle={() => setExpandedId(isExpanded ? null : reservation.id)}
            onCancel={() => handleCancel(reservation.id)}
            isCancelling={cancellingId === reservation.id}
          />
        )
      })}
    </div>
  )
}

function ReservationCard({ reservation, status, isExpanded, onToggle, onCancel, isCancelling }: any) {
  const { data: preOrderData, isLoading: preOrderLoading } = trpc.reservation.getMyPreOrder.useQuery(
    { reservationId: reservation.id },
    { enabled: isExpanded }
  )

  const hasPreOrder = preOrderData && preOrderData.items && preOrderData.items.length > 0
  const totalPrice = hasPreOrder 
    ? preOrderData.items.reduce((sum: number, item: any) => sum + parseFloat(item.menuItem.price) * item.quantity, 0)
    : 0

  const guestWord = getPlural(reservation.guestCount, 'гость', 'гостя', 'гостей')
  const itemsWord = hasPreOrder ? getPlural(preOrderData.items.length, 'блюдо', 'блюда', 'блюд') : ''

  return (
    <div className="bg-zinc-900 rounded-xl p-5 shadow-xl border border-zinc-800">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-lg text-white">Столик №{reservation.table?.number}</h3>
          <p className="text-sm text-zinc-400">
            {format(new Date(reservation.date), "d MMMM yyyy", { locale: ru })} в {reservation.time?.slice(0, 5)}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}>{status.label}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div>
          <span className="text-zinc-500">Гостей:</span>{" "}
          <span className="font-medium text-white">{reservation.guestCount} {guestWord}</span>
        </div>
        <div>
          <span className="text-zinc-500">Длительность:</span>{" "}
          <span className="font-medium text-white">{reservation.duration} мин</span>
        </div>
        {reservation.specialRequests && (
          <div className="col-span-2">
            <span className="text-zinc-500">Пожелания:</span>{" "}
            <span className="italic text-zinc-300">{reservation.specialRequests}</span>
          </div>
        )}
      </div>

      <button onClick={onToggle} className="flex items-center gap-2 text-amber-500 hover:text-amber-400 text-sm font-medium mb-3">
        <ShoppingCart size={16} />
        {isExpanded 
          ? "Скрыть предзаказ" 
          : hasPreOrder 
            ? `Показать предзаказ (${preOrderData.items.length} ${itemsWord})` 
            : "Показать предзаказ"}
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <div className="mb-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          {preOrderLoading ? (
            <p className="text-zinc-400 text-sm">Загрузка предзаказа...</p>
          ) : hasPreOrder ? (
            <>
              <h4 className="font-medium text-amber-400 mb-3">Ваш предзаказ</h4>
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
                  <span className="text-zinc-400">Ваши заметки: </span>
                  <span className="italic text-zinc-300">{preOrderData.specialNotes}</span>
                </div>
              )}
              <div className="border-t border-zinc-700 pt-2 flex justify-between font-medium">
                <span className="text-zinc-300">Итого:</span>
                <span className="text-amber-500">{formatPrice(totalPrice)}</span>
              </div>
            </>
          ) : (
            <p className="text-zinc-400 text-sm">Нет предзаказа для этого бронирования</p>
          )}
        </div>
      )}

      {reservation.status === "pending" && (
        <button onClick={onCancel} disabled={isCancelling} className="text-sm text-red-400 hover:text-red-300 font-medium disabled:opacity-50">
          {isCancelling ? "Отмена..." : "Отменить бронирование"}
        </button>
      )}
    </div>
  )
}