"use client"

import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import { Heart, Plus, LogIn } from "lucide-react"
import { useState } from "react"
import { useCart } from "@/hooks/use-cart"
import { toast } from "sonner"
import Link from "next/link"
import { useSession } from "@/lib/auth-client"

interface MenuCardProps {
  id: string
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
  isFavorite?: boolean
  onFavoriteToggle?: (id: string) => void
  onClick?: () => void
  showAddToCart?: boolean
}

export function MenuCard({ 
  id,
  name, 
  description, 
  price, 
  imageUrl, 
  ingredients,
  isPopular,
  isAvailable = true,
  isFavorite = false,
  onFavoriteToggle,
  onClick,
  showAddToCart = false,
}: MenuCardProps) {
  const [imageError, setImageError] = useState(false)
  const { addItem } = useCart()
  const { data: session } = useSession()

  const getCategoryEmoji = () => {
    if (!ingredients) return "🍝"
    const text = ingredients.join(" ").toLowerCase()
    if (text.includes("телят") || text.includes("гуанчиале") || text.includes("мяс")) return "🥩"
    if (text.includes("рыб") || text.includes("морепродукт")) return "🐟"
    if (text.includes("маскарпоне") || text.includes("тирамису") || text.includes("десерт")) return "🍰"
    if (text.includes("вино") || text.includes("апероль") || text.includes("коктейл")) return "🍷"
    if (text.includes("пицца")) return "🍕"
    return "🍝"
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFavoriteToggle?.(id)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAvailable) {
      toast.error("Блюдо временно недоступно")
      return
    }
    addItem({ id, name, price })
    toast.success(`${name} добавлено в корзину`)
  }

  const canAddToCart = showAddToCart && session && isAvailable
  const showLoginButton = showAddToCart && !session

  return (
    <div 
      onClick={onClick}
      className="group bg-zinc-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-amber-600/10 transition-all duration-300 border border-zinc-700 hover:border-amber-600/50 cursor-pointer"
    >
      <div className="relative h-52 bg-gradient-to-br from-zinc-700 to-zinc-800">
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            {getCategoryEmoji()}
          </div>
        )}
        
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-red-600/90 text-white text-sm px-3 py-1.5 rounded-full">
              Нет в наличии
            </span>
          </div>
        )}
        
        {onFavoriteToggle && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 z-10 p-2 bg-black/50 backdrop-blur-sm rounded-full shadow-md hover:bg-black/70 transition-colors"
          >
            <Heart 
              size={20} 
              className={`transition-colors ${isFavorite ? 'fill-amber-500 text-amber-500' : 'text-zinc-300'}`}
            />
          </button>
        )}
        
        {isPopular && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-md">
            🔥 Популярное
          </span>
        )}
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-white">{name}</h3>
          <span className="font-bold text-amber-500 text-lg">{formatPrice(price)}</span>
        </div>
        
        <p className="text-zinc-400 text-sm mb-3 line-clamp-2">{description}</p>
        
        {ingredients && ingredients.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {ingredients.slice(0, 3).map((ingredient, i) => (
              <span key={i} className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded-full">
                {ingredient}
              </span>
            ))}
            {ingredients.length > 3 && (
              <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded-full">
                +{ingredients.length - 3}
              </span>
            )}
          </div>
        )}
        
        {canAddToCart && (
          <button
            onClick={handleAddToCart}
            className="w-full mt-2 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg font-medium hover:from-amber-500 hover:to-amber-400 transition flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            В корзину
          </button>
        )}
        
        {showLoginButton && (
          <Link
            href="/sign-in"
            onClick={(e) => e.stopPropagation()}
            className="w-full mt-2 py-2 border border-amber-600 text-amber-500 rounded-lg font-medium hover:bg-amber-600/20 transition flex items-center justify-center gap-2"
          >
            <LogIn size={16} />
            Войти для заказа
          </Link>
        )}
        
        {!isAvailable && showAddToCart && session && (
          <button
            disabled
            className="w-full mt-2 py-2 bg-zinc-700 text-zinc-500 rounded-lg font-medium cursor-not-allowed"
          >
            Нет в наличии
          </button>
        )}
        
        <p className="text-amber-500 text-xs mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          Нажмите для подробностей →
        </p>
      </div>
    </div>
  )
}