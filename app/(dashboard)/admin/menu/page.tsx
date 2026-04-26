"use client"

import { trpc } from "@/lib/trpc/react"
import { useState } from "react"
import { formatPrice } from "@/lib/utils"
import { Pencil, Trash2, Plus, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

const categoryLabels: Record<string, string> = {
  antipasti: "Закуски",
  primi: "Первые блюда",
  secondi: "Вторые блюда",
  contorni: "Гарниры",
  dolci: "Десерты",
  bevande: "Напитки",
}

export default function AdminMenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const { data: items, isLoading, refetch } = trpc.menu.getAll.useQuery()
  
  const toggleAvailability = trpc.menu.toggleAvailability.useMutation({
    onSuccess: () => {
      refetch()
      toast.success("Статус обновлён")
    },
  })
  
  const deleteItem = trpc.menu.delete.useMutation({
    onSuccess: () => {
      refetch()
      toast.success("Блюдо удалено")
    },
  })

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Удалить блюдо "${name}"?`)) {
      deleteItem.mutate({ id })
    }
  }

  const categories = ["all", ...Object.keys(categoryLabels)]
  const filteredItems = items?.filter(
    (item: any) => selectedCategory === "all" || item.category === selectedCategory
  )

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
        <h1 className="text-3xl font-serif text-amber-400">Управление меню</h1>
        <Link
          href="/admin/menu/new"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-amber-400 transition"
        >
          <Plus size={18} />
          Добавить блюдо
        </Link>
      </div>

      {/* Фильтр */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedCategory === cat
                ? "bg-amber-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700"
            }`}
          >
            {cat === "all" ? "Все" : categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Таблица */}
      <div className="bg-zinc-900 rounded-xl shadow-lg overflow-hidden border border-zinc-800">
        <table className="w-full">
          <thead className="bg-zinc-800 border-b border-zinc-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Блюдо</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Категория</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Цена</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Статус</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-zinc-300">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredItems?.map((item: any) => (
              <tr key={item.id} className="hover:bg-zinc-800/50 transition">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-white">{item.name}</p>
                    <p className="text-sm text-zinc-400 truncate max-w-xs">{item.description}</p>
                    {item.isPopular && (
                      <span className="inline-block mt-1 text-xs bg-amber-600/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-600/30">
                        🔥 Популярное
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-300">
                  {categoryLabels[item.category] || item.category}
                </td>
                <td className="px-4 py-3 font-medium text-amber-500">
                  {formatPrice(item.price)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleAvailability.mutate({ id: item.id })}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                      item.isAvailable
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }`}
                  >
                    {item.isAvailable ? (
                      <><Eye size={12} /> В наличии</>
                    ) : (
                      <><EyeOff size={12} /> Нет в наличии</>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/menu/${item.id}/edit`}
                      className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-zinc-700 rounded-lg transition"
                    >
                      <Pencil size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredItems?.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            Нет блюд в этой категории
          </div>
        )}
      </div>
    </div>
  )
}