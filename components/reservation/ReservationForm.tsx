"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { trpc } from "@/lib/trpc/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useCart } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"
import { ShoppingCart } from "lucide-react"

const reservationSchema = z.object({
  date: z.string().min(1, "Выберите дату"),
  time: z.string().min(1, "Выберите время"),
  guestCount: z.number().min(1).max(10),
  specialRequests: z.string().optional(),
})

type ReservationFormData = z.infer<typeof reservationSchema>

interface ReservationFormProps {
  tableId: string
  tableNumber: number
  capacity: number
  onSuccess?: () => void
}

const getPlural = (count: number, one: string, few: string, many: string) => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

export function ReservationForm({ tableId, tableNumber, capacity, onSuccess }: ReservationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { items, clearCart, getTotalPrice } = useCart()
  const [specialNotes, setSpecialNotes] = useState("")
  
  useEffect(() => {
    const pendingCart = sessionStorage.getItem("pendingCart")
    if (pendingCart) sessionStorage.removeItem("pendingCart")
  }, [])
  
  const createReservation = trpc.reservation.createWithPreOrder.useMutation({
    onSuccess: () => {
      toast.success("Бронирование успешно создано!")
      clearCart()
      router.push("/profile/reservations")
      router.refresh()
      onSuccess?.()
    },
    onError: (error) => toast.error(error.message || "Ошибка при создании бронирования"),
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { guestCount: Math.min(2, capacity), specialRequests: "" },
  })

  const selectedDate = watch("date")
  const timeSlots = [
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
    "20:00", "20:30", "21:00", "21:30", "22:00"
  ]

  const onSubmit = (data: ReservationFormData) => {
    setIsSubmitting(true)
    const preOrderItems = items.map((item) => ({
      menuItemId: item.id,
      quantity: item.quantity,
      notes: item.notes || undefined,
    }))
    
    createReservation.mutate({
      reservation: {
        tableId,
        date: new Date(data.date),
        time: data.time,
        guestCount: data.guestCount,
        duration: 120,
        specialRequests: data.specialRequests,
      },
      preOrderItems: preOrderItems.length > 0 ? preOrderItems : undefined,
      specialNotes: specialNotes || undefined,
    })
    setIsSubmitting(false)
  }

  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const totalPrice = getTotalPrice()
  const itemsWord = getPlural(items.length, 'блюдо', 'блюда', 'блюд')

  return (
    <div className="bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-800">
      <h3 className="text-xl font-serif text-amber-400 mb-4">Бронирование столика №{tableNumber}</h3>
      <p className="text-sm text-zinc-400 mb-6">Вместимость: до {capacity} человек</p>

      {items.length > 0 && (
        <div className="mb-6 p-4 bg-zinc-800/50 rounded-lg border border-amber-600/30">
          <h4 className="font-medium text-amber-400 mb-3 flex items-center gap-2">
            <ShoppingCart size={16} />
            Предзаказ ({items.length} {itemsWord})
          </h4>
          <div className="space-y-2 mb-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-zinc-300">{item.name} × {item.quantity}</span>
                <span className="text-amber-500">{formatPrice(parseFloat(item.price) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-zinc-700 pt-2 flex justify-between font-medium">
            <span className="text-zinc-300">Итого:</span>
            <span className="text-amber-500">{formatPrice(totalPrice)}</span>
          </div>
          <button type="button" onClick={() => router.push("/menu")} className="mt-3 text-sm text-amber-500 hover:text-amber-400">
            + Добавить ещё блюда
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Дата визита</label>
          <input type="date" min={today} max={maxDate} {...register("date")} className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white" />
          {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date.message}</p>}
        </div>

        {selectedDate && (
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Время</label>
            <select {...register("time")} className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white">
              <option value="">Выберите время</option>
              {timeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
            </select>
            {errors.time && <p className="text-red-400 text-sm mt-1">{errors.time.message}</p>}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Количество гостей</label>
          <select {...register("guestCount", { valueAsNumber: true })} className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white">
            {Array.from({ length: Math.min(capacity, 10) }, (_, i) => i + 1).map((num) => {
              const word = getPlural(num, 'гость', 'гостя', 'гостей')
              return <option key={num} value={num}>{num} {word}</option>
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Особые пожелания</label>
          <textarea {...register("specialRequests")} rows={2} placeholder="Аллергии, повод, предпочтения..." className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white resize-none" />
        </div>

        {items.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Заметки к заказу</label>
            <textarea value={specialNotes} onChange={(e) => setSpecialNotes(e.target.value)} rows={2} placeholder="Например: соус отдельно, без лука..." className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white resize-none" />
          </div>
        )}

        <button type="submit" disabled={isSubmitting || createReservation.isPending} className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-3 rounded-lg font-medium hover:from-amber-500 hover:to-amber-400 transition disabled:opacity-50">
          {createReservation.isPending ? "Создание..." : "Забронировать"}
        </button>
      </form>
    </div>
  )
}