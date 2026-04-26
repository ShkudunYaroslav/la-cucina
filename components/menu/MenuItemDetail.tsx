"use client"

import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import { Clock, AlertTriangle, Check } from "lucide-react"

interface MenuItemDetailProps {
  name: string
  description: string
  price: string
  imageUrl?: string | null
  ingredients?: string[]
  allergens?: string[]
  preparationTime?: number | null
  category?: string
  isPopular?: boolean
  isAvailable?: boolean
}

export function MenuItemDetail({
  name,
  description,
  price,
  imageUrl,
  ingredients,
  allergens,
  preparationTime,
  category,
  isPopular,
  isAvailable = true,
}: MenuItemDetailProps) {
  const categoryLabels: Record<string, string> = {
    antipasti: "Закуска",
    primi: "Первое блюдо",
    secondi: "Второе блюдо",
    contorni: "Гарнир",
    dolci: "Десерт",
    bevande: "Напиток",
  }

  return (
    <div className="space-y-6 text-zinc-200">
      {imageUrl && (
        <div className="relative h-64 rounded-xl overflow-hidden">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
          />
          {isPopular && (
            <span className="absolute top-4 left-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white text-sm px-3 py-1.5 rounded-full font-medium">
              🔥 Популярное блюдо
            </span>
          )}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-red-600 text-white text-lg px-6 py-2 rounded-full font-medium">
                Нет в наличии
              </span>
            </div>
          )}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-serif text-amber-400">{name}</h3>
          <span className="text-2xl font-bold text-amber-500">{formatPrice(price)}</span>
        </div>
        {category && (
          <span className="inline-block text-sm bg-amber-600/20 text-amber-400 px-3 py-1 rounded-full border border-amber-600/30">
            {categoryLabels[category] || category}
          </span>
        )}
      </div>

      <div>
        <h4 className="font-medium text-white mb-2">Описание</h4>
        <p className="text-zinc-400 leading-relaxed">{description}</p>
      </div>

      {preparationTime !== undefined && preparationTime !== null && (
        <div className="flex items-center gap-2 text-zinc-400">
          <Clock size={18} className="text-amber-500" />
          {preparationTime === 0 ? (
            <span><strong className="text-white">Готово к подаче</strong> (подготавливается заранее)</span>
          ) : (
            <span>Время приготовления: <strong className="text-white">{preparationTime} мин</strong></span>
          )}
        </div>
      )}

      {ingredients && ingredients.length > 0 && (
        <div>
          <h4 className="font-medium text-white mb-3">Ингредиенты</h4>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ingredient, i) => (
              <span
                key={i}
                className="bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-full text-sm"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      )}

      {allergens && allergens.length > 0 && (
        <div>
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            Аллергены
          </h4>
          <div className="flex flex-wrap gap-2">
            {allergens.map((allergen, i) => (
              <span
                key={i}
                className="bg-red-900/30 text-red-300 px-3 py-1.5 rounded-full text-sm border border-red-700/50"
              >
                {allergen}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className={`flex items-center gap-2 p-4 rounded-lg ${isAvailable ? 'bg-green-900/20 border border-green-700/50' : 'bg-red-900/20 border border-red-700/50'}`}>
        {isAvailable ? (
          <>
            <Check size={20} className="text-green-500" />
            <span className="text-green-400">Блюдо доступно для заказа</span>
          </>
        ) : (
          <>
            <AlertTriangle size={20} className="text-red-500" />
            <span className="text-red-400">Временно отсутствует</span>
          </>
        )}
      </div>
    </div>
  )
}