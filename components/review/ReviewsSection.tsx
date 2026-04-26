"use client"

import { trpc } from "@/lib/trpc/react"
import { Star } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

export function ReviewsSection() {
  const { data: reviews, isLoading } = trpc.review.getPublished.useQuery()

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (!reviews?.length) {
    return (
      <div className="text-center py-8 text-zinc-400">
        Пока нет отзывов. Будьте первым!
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {reviews.map((review: any) => (
        <div key={review.id} className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-7 shadow-xl hover:shadow-2xl transition border border-zinc-700">
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, j) => (
              <Star
                key={j}
                size={18}
                className={j < review.rating ? "fill-amber-500 text-amber-500" : "text-zinc-500"}
              />
            ))}
          </div>
          <p className="text-zinc-300 mb-5 italic leading-relaxed">{review.comment}</p>
          <div className="flex justify-between items-center">
            <p className="font-bold text-amber-400">{review.user?.name || "Гость"}</p>
            <span className="text-sm text-zinc-500">
              {review.createdAt ? format(new Date(review.createdAt), "d MMM", { locale: ru }) : ""}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}