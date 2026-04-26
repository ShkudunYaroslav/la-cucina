// @ts-nocheck
"use client"

import { trpc } from "@/lib/trpc/react"
import { MenuCard } from "./MenuCard"
import { MenuItemDetail } from "./MenuItemDetail"
import { Modal } from "@/components/ui/Modal"
import { useState } from "react"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"

interface MenuItem {
  id: string
  name: string
  description: string
  price: string
  category: string
  imageUrl: string | null
  ingredients: string[] | null
  allergens: string[] | null
  preparationTime: number | null
  isPopular: boolean | null
  isAvailable: boolean
}

const categories = [
  { value: "all", label: "Все блюда" },
  { value: "antipasti", label: "Закуски" },
  { value: "primi", label: "Первые блюда" },
  { value: "secondi", label: "Вторые блюда" },
  { value: "contorni", label: "Гарниры" },
  { value: "dolci", label: "Десерты" },
  { value: "bevande", label: "Напитки" },
]

interface MenuGridProps {
  showAddToCart?: boolean
}

export function MenuGrid({ showAddToCart = false }: MenuGridProps) {
  const utils = trpc.useUtils()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const { data: session } = useSession()
  
  const { data: items, isLoading, error } = trpc.menu.getAll.useQuery()
  const { data: favoriteIds = [], refetch: refetchFavorites } = 
    trpc.favorite.getMyFavoriteIds.useQuery(undefined, {
      enabled: !!session,
    })
  
  const addFavorite = trpc.favorite.add.useMutation({
  onSuccess: () => {
    refetchFavorites()
    utils.favorite.getMyFavorites.invalidate()
    utils.favorite.getMyFavoriteIds.invalidate()
    toast.success("Добавлено в избранное")
  },
  onError: (error) => toast.error(error.message),
})
  
  const removeFavorite = trpc.favorite.remove.useMutation({
  onSuccess: () => {
    refetchFavorites()
    utils.favorite.getMyFavorites.invalidate()
    utils.favorite.getMyFavoriteIds.invalidate()
    toast.success("Удалено из избранного")
  },
  onError: (error) => toast.error(error.message),
})
  
  const handleFavoriteToggle = (id: string) => {
    if (!session) {
      toast.error("Войдите в аккаунт, чтобы добавлять в избранное")
      return
    }
    
    if (favoriteIds.includes(id)) {
      removeFavorite.mutate({ menuItemId: id })
    } else {
      addFavorite.mutate({ menuItemId: id })
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <p className="text-zinc-600 mt-4">Загрузка меню...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Ошибка загрузки: {error.message}</p>
      </div>
    )
  }

  const uniqueItems = items?.filter(
    (item: MenuItem, index: number, self: MenuItem[]) => 
      self.findIndex((i: MenuItem) => i.name === item.name) === index
  )

  const filteredItems = uniqueItems?.filter(
    (item: MenuItem) => selectedCategory === "all" || item.category === selectedCategory
  )

  return (
    <>
      <div>
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === cat.value
                  ? "bg-amber-600 text-white shadow-md"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filteredItems && filteredItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item: MenuItem) => (
              <MenuCard
                key={item.id}
                id={item.id}
                name={item.name}
                description={item.description}
                price={item.price}
                imageUrl={item.imageUrl}
                ingredients={item.ingredients || []}
                allergens={item.allergens || []}
                preparationTime={item.preparationTime}
                category={item.category}
                isPopular={item.isPopular || false}
                isAvailable={item.isAvailable}
                isFavorite={favoriteIds.includes(item.id)}
                onFavoriteToggle={handleFavoriteToggle}
                onClick={() => setSelectedItem(item)}
                showAddToCart={showAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-zinc-600">Блюда не найдены</p>
          </div>
        )}
      </div>

      {/* Модальное окно с деталями */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.name}
      >
        {selectedItem && (
          <MenuItemDetail
            name={selectedItem.name}
            description={selectedItem.description}
            price={selectedItem.price}
            imageUrl={selectedItem.imageUrl}
            ingredients={selectedItem.ingredients || []}
            allergens={selectedItem.allergens || []}
            preparationTime={selectedItem.preparationTime}
            category={selectedItem.category}
            isPopular={selectedItem.isPopular || false}
            isAvailable={selectedItem.isAvailable}
          />
        )}
      </Modal>
    </>
  )
}