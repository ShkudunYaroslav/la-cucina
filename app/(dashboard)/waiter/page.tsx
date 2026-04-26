"use client"

import { trpc } from "@/lib/trpc/react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { toast } from "sonner"
import { Check, X, Coffee, Clock, Users, Utensils, ShoppingCart, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { formatPrice } from "@/lib/utils"

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Ожидает", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  confirmed: { label: "Подтверждено", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  arrived: { label: "Гость прибыл", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  completed: { label: "Завершено", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  cancelled: { label: "Отменено", color: "bg-red-500/20 text-red-400 border-red-500/30" },
}

const getPlural = (count: number, one: string, few: string, many: string) => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

export default function WaiterPage() {
  const { data: todayReservations, isLoading, refetch } = trpc.reservation.getTodayReservations.useQuery()
  
  const markArrived = trpc.reservation.markArrived.useMutation({
    onSuccess: () => { refetch(); toast.success("Гость отмечен как прибывший") },
    onError: (error: any) => toast.error(error.message),
  })

  const markCompleted = trpc.reservation.markCompleted.useMutation({
    onSuccess: () => { refetch(); toast.success("Визит завершён") },
    onError: (error: any) => toast.error(error.message),
  })

  const cancelByStaff = trpc.reservation.cancelByStaff.useMutation({
    onSuccess: () => { refetch(); toast.success("Бронирование отменено") },
    onError: (error: any) => toast.error(error.message),
  })

  const handleArrived = (id: string) => markArrived.mutate({ id })
  const handleComplete = (id: string) => markCompleted.mutate({ id })
  const handleCancel = (id: string) => {
    if (confirm("Отменить бронирование?")) cancelByStaff.mutate({ id })
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        <p className="text-zinc-400 mt-4">Загрузка бронирований...</p>
      </div>
    )
  }

  const confirmedReservations = todayReservations?.filter((r: any) => r.status === "confirmed") || []
  const arrivedReservations = todayReservations?.filter((r: any) => r.status === "arrived") || []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif text-amber-400">Панель официанта</h1>
        <div className="text-sm text-zinc-400">{format(new Date(), "d MMMM yyyy, EEEE", { locale: ru })}</div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-900 rounded-xl p-4 shadow-lg border border-zinc-800">
          <p className="text-sm text-zinc-500">Всего на сегодня</p>
          <p className="text-3xl font-bold text-white">{todayReservations?.length || 0}</p>
        </div>
        <div className="bg-green-900/20 rounded-xl p-4 shadow-lg border border-green-700/30">
          <p className="text-sm text-green-400">Подтверждено</p>
          <p className="text-3xl font-bold text-green-400">{confirmedReservations.length}</p>
        </div>
        <div className="bg-blue-900/20 rounded-xl p-4 shadow-lg border border-blue-700/30">
          <p className="text-sm text-blue-400">Гости в зале</p>
          <p className="text-3xl font-bold text-blue-400">
            {arrivedReservations.reduce((sum: number, r: any) => sum + (r.guestCount || 0), 0)}
          </p>
        </div>
        <div className="bg-amber-900/20 rounded-xl p-4 shadow-lg border border-amber-700/30">
          <p className="text-sm text-amber-400">Столиков занято</p>
          <p className="text-3xl font-bold text-amber-400">{arrivedReservations.length}</p>
        </div>
      </div>

      {/* Ожидают прибытия */}
      {confirmedReservations.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3 flex items-center gap-2 text-green-400">
            <Clock size={20} /> Ожидают прибытия
          </h2>
          <div className="grid gap-3">
            {confirmedReservations.map((res: any) => (
              <ReservationCard 
                key={res.id} 
                reservation={res} 
                onArrived={() => handleArrived(res.id)} 
                onCancel={() => handleCancel(res.id)} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Гости в зале */}
      {arrivedReservations.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3 flex items-center gap-2 text-blue-400">
            <Users size={20} /> Гости в зале
          </h2>
          <div className="grid gap-3">
            {arrivedReservations.map((res: any) => (
              <ReservationCard 
                key={res.id} 
                reservation={res} 
                isArrived 
                onComplete={() => handleComplete(res.id)} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Пусто */}
      {todayReservations?.length === 0 && (
        <div className="text-center py-12 bg-zinc-900 rounded-xl border border-zinc-800">
          <Coffee size={48} className="mx-auto text-zinc-600 mb-3" />
          <p className="text-zinc-400">На сегодня бронирований пока нет</p>
        </div>
      )}
    </div>
  )
}

function ReservationCard({ reservation, isArrived, onArrived, onComplete, onCancel }: any) {
  const [showPreOrder, setShowPreOrder] = useState(false)
  
  const { data: preOrderData } = trpc.reservation.getPreOrder.useQuery(
    { reservationId: reservation.id },
    { enabled: !!reservation.id }
  )

  const hasPreOrder = preOrderData && preOrderData.items && preOrderData.items.length > 0
  const totalPrice = hasPreOrder 
    ? preOrderData.items.reduce((sum: number, item: any) => sum + parseFloat(item.menuItem.price) * item.quantity, 0)
    : 0

  const guestWord = getPlural(reservation.guestCount, 'гость', 'гостя', 'гостей')
  const itemsWord = hasPreOrder ? getPlural(preOrderData.items.length, 'блюдо', 'блюда', 'блюд') : ''

  return (
    <div className="bg-zinc-900 rounded-xl p-4 shadow-lg border border-zinc-800 hover:border-amber-600/30 transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl font-bold text-amber-400">{reservation.time?.slice(0, 5)}</span>
            <span className="px-2 py-1 bg-amber-600/20 text-amber-400 rounded-full text-sm border border-amber-600/30">
              Столик №{reservation.table?.number}
            </span>
            <span className="text-sm text-zinc-500">{reservation.table?.capacity} мест</span>
          </div>
          
          <p className="font-medium text-lg text-white mb-1">{reservation.user?.name}</p>
          <p className="text-sm text-zinc-400 mb-2">{reservation.user?.phone || "Телефон не указан"}</p>
          
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1">
              <Users size={14} /> <span className="text-zinc-300">{reservation.guestCount} {guestWord}</span>
            </span>
            {reservation.specialRequests && (
              <span className="flex items-center gap-1">
                <Utensils size={14} /> <span className="text-zinc-300">{reservation.specialRequests}</span>
              </span>
            )}
            {hasPreOrder && (
              <button 
                onClick={() => setShowPreOrder(!showPreOrder)} 
                className="flex items-center gap-1 text-amber-500 hover:text-amber-400"
              >
                <ShoppingCart size={14} />
                Предзаказ ({preOrderData.items.length} {itemsWord})
                {showPreOrder ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>

          {/* Детали предзаказа */}
          {showPreOrder && hasPreOrder && (
            <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
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
          )}
        </div>

        <div className="flex flex-col gap-2">
          {!isArrived && onArrived && (
            <button 
              onClick={onArrived} 
              className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1 transition"
            >
              <Check size={16} /> Прибыл
            </button>
          )}
          {isArrived && onComplete && (
            <button 
              onClick={onComplete} 
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1 transition"
            >
              <Check size={16} /> Завершить
            </button>
          )}
          {!isArrived && onCancel && (
            <button 
              onClick={onCancel} 
              className="px-3 py-2 border border-red-500/50 text-red-400 rounded-lg text-sm hover:bg-red-900/30 hover:border-red-400 flex items-center gap-1 transition"
            >
              <X size={16} /> Отменить
            </button>
          )}
        </div>
      </div>
    </div>
  )
}