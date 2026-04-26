"use client"

import { trpc } from "@/lib/trpc/react"
import { MenuCard } from "@/components/menu/MenuCard"
import Link from "next/link"
import { toast } from "sonner"

export default function FavoritesPage() {
  const utils = trpc.useUtils()
  
  const { data: favoriteItems, isLoading } = trpc.favorite.getMyFavorites.useQuery()
  
  const removeFavorite = trpc.favorite.remove.useMutation({
    onSuccess: () => {
      toast.success("Удалено из избранного")
      // Инвалидируем все связанные запросы
      utils.favorite.getMyFavorites.invalidate()
      utils.favorite.getMyFavoriteIds.invalidate()
    },
  })
  
  const handleFavoriteToggle = (id: string) => {
    removeFavorite.mutate({ menuItemId: id })
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <p className="text-zinc-600 mt-4">Загрузка...</p>
      </div>
    )
  }

  if (!favoriteItems?.length) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❤️</div>
        <h2 className="text-xl font-serif text-amber-900 mb-2">Нет избранных блюд</h2>
        <p className="text-zinc-600 mb-6">Добавляйте блюда в избранное, нажимая на сердечко</p>
        <Link
          href="/menu"
          className="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
        >
          Перейти в меню
        </Link>
      </div>
    )
  }

  return (
    <div>
      <p className="text-zinc-600 mb-6">У вас {favoriteItems.length} {getPlural(favoriteItems.length, 'блюдо', 'блюда', 'блюд')} в избранном</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteItems.map((item: any) => (
          <MenuCard
            key={item.id}
            id={item.id}
            name={item.name}
            description={item.description}
            price={item.price}
            imageUrl={item.imageUrl}
            ingredients={item.ingredients || []}
            isPopular={item.isPopular || false}
            isFavorite={true}
            onFavoriteToggle={handleFavoriteToggle}
          />
        ))}
      </div>
    </div>
  )
}

const getPlural = (count: number, one: string, few: string, many: string) => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}