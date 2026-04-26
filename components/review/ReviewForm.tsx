"use client"

import { useState } from "react"
import { trpc } from "@/lib/trpc/react"
import { toast } from "sonner"
import { Star } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import Link from "next/link"

export function ReviewForm() {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: session } = useSession()
  const utils = trpc.useUtils()

  const createReview = trpc.review.create.useMutation({
    onSuccess: () => {
      toast.success("Спасибо за отзыв!")
      setRating(0)
      setComment("")
      utils.review.getPublished.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Поставьте оценку")
      return
    }
    if (comment.length < 5) {
      toast.error("Минимум 5 символов")
      return
    }
    setIsSubmitting(true)
    
    // Передаём ТОЛЬКО rating и comment, без reservationId
    createReview.mutate({ 
      rating, 
      comment,
    })
    
    setIsSubmitting(false)
  }

  if (!session) {
    return (
      <div className="text-center p-6 bg-zinc-800/50 rounded-xl border border-zinc-700">
        <p className="text-zinc-400 mb-3">Войдите, чтобы оставить отзыв</p>
        <Link href="/sign-in" className="text-amber-500 hover:underline">Войти</Link>
      </div>
    )
  }

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700">
      <h3 className="text-lg font-medium text-white mb-4">Оставить отзыв</h3>
      
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={28}
              className={`transition-colors ${
                star <= (hoverRating || rating)
                  ? "fill-amber-500 text-amber-500"
                  : "text-zinc-500"
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="text-sm text-zinc-400 ml-2">
            {rating === 5 ? "Отлично!" : rating === 4 ? "Хорошо" : rating === 3 ? "Нормально" : rating === 2 ? "Плохо" : "Ужасно"}
          </span>
        )}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Расскажите о ваших впечатлениях..."
        rows={4}
        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 text-white placeholder:text-zinc-500 resize-none"
      />

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="mt-4 w-full py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-amber-400 transition disabled:opacity-50"
      >
        {isSubmitting ? "Отправка..." : "Отправить отзыв"}
      </button>
    </div>
  )
}