"use client"

import { trpc } from "@/lib/trpc/react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"

const menuItemSchema = z.object({
  name: z.string().min(2, "Название должно содержать минимум 2 символа"),
  description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Некорректная цена"),
  category: z.enum(['antipasti', 'primi', 'secondi', 'contorni', 'dolci', 'bevande']),
  imageUrl: z.string().url().optional().or(z.literal('')),
  ingredients: z.array(z.object({ value: z.string() })).min(1, "Добавьте хотя бы один ингредиент"),
  allergens: z.array(z.object({ value: z.string() })).optional(),
  isAvailable: z.boolean(),
  isPopular: z.boolean(),
  preparationTime: z.number().min(0).optional().nullable(),
})

type MenuItemFormData = {
  name: string
  description: string
  price: string
  category: 'antipasti' | 'primi' | 'secondi' | 'contorni' | 'dolci' | 'bevande'
  imageUrl: string
  ingredients: { value: string }[]
  allergens: { value: string }[]
  isAvailable: boolean
  isPopular: boolean
  preparationTime: number | null
}

const categoryOptions = [
  { value: "antipasti", label: "Закуски" },
  { value: "primi", label: "Первые блюда" },
  { value: "secondi", label: "Вторые блюда" },
  { value: "contorni", label: "Гарниры" },
  { value: "dolci", label: "Десерты" },
  { value: "bevande", label: "Напитки" },
]

export default function NewMenuItemPage() {
  const router = useRouter()
  const createItem = trpc.menu.create.useMutation({
    onSuccess: () => {
      toast.success("Блюдо добавлено")
      router.push("/admin/menu")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      price: "",
      category: "antipasti",
      imageUrl: "",
      ingredients: [{ value: "" }],
      allergens: [],
      isAvailable: true,
      isPopular: false,
      preparationTime: null,
    },
  })

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = 
    useFieldArray({ control, name: "ingredients" })
  
  const { fields: allergenFields, append: appendAllergen, remove: removeAllergen } = 
    useFieldArray({ control, name: "allergens" })

  const onSubmit = (data: MenuItemFormData) => {
    createItem.mutate({
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      imageUrl: data.imageUrl || null,
      ingredients: data.ingredients.map(i => i.value),
      allergens: data.allergens?.map(a => a.value) || [],
      isAvailable: data.isAvailable,
      isPopular: data.isPopular,
      preparationTime: data.preparationTime,
    })
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/menu" className="p-2 hover:bg-zinc-800 rounded-lg transition text-zinc-400 hover:text-white">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-serif text-amber-400">Новое блюдо</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-zinc-900 rounded-xl shadow-xl border border-zinc-800 p-6 space-y-6">
        {/* Название */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Название *</label>
          <input
            {...register("name")}
            placeholder="Например: Pizza Margherita"
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white placeholder:text-zinc-500"
          />
          {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
        </div>

        {/* Категория */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Категория *</label>
          <select
            {...register("category")}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white"
          >
            {categoryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>}
        </div>

        {/* Описание */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Описание *</label>
          <textarea
            {...register("description")}
            rows={3}
            placeholder="Подробное описание блюда..."
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white placeholder:text-zinc-500 resize-none"
          />
          {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>}
        </div>

        {/* Цена и время */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Цена (₽) *</label>
            <input
              {...register("price")}
              placeholder="450.00"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white placeholder:text-zinc-500"
            />
            {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Время приготовления (мин)</label>
            <input
              type="number"
              {...register("preparationTime", { 
                setValueAs: (v) => v === "" ? null : Number(v) 
              })}
              placeholder="15"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white placeholder:text-zinc-500"
            />
          </div>
        </div>

        {/* URL изображения */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">URL изображения</label>
          <input
            {...register("imageUrl")}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white placeholder:text-zinc-500"
          />
        </div>

        {/* Ингредиенты */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Ингредиенты *</label>
          <div className="space-y-2">
            {ingredientFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input
                  {...register(`ingredients.${index}.value` as const)}
                  placeholder={`Ингредиент ${index + 1}`}
                  className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white placeholder:text-zinc-500"
                />
                {ingredientFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => appendIngredient({ value: "" })}
            className="mt-2 flex items-center gap-1 text-sm text-amber-500 hover:text-amber-400"
          >
            <Plus size={16} /> Добавить ингредиент
          </button>
          {errors.ingredients && <p className="text-red-400 text-sm mt-1">{errors.ingredients.message}</p>}
        </div>

        {/* Аллергены */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Аллергены</label>
          <div className="space-y-2">
            {allergenFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input
                  {...register(`allergens.${index}.value` as const)}
                  placeholder={`Аллерген ${index + 1}`}
                  className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white placeholder:text-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => removeAllergen(index)}
                  className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => appendAllergen({ value: "" })}
            className="mt-2 flex items-center gap-1 text-sm text-amber-500 hover:text-amber-400"
          >
            <Plus size={16} /> Добавить аллерген
          </button>
        </div>

        {/* Чекбоксы */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              {...register("isAvailable")} 
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500" 
            />
            <span className="text-sm text-zinc-300">В наличии</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              {...register("isPopular")} 
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500" 
            />
            <span className="text-sm text-zinc-300">Популярное блюдо</span>
          </label>
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 pt-4 border-t border-zinc-800">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-amber-400 transition disabled:opacity-50"
          >
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </button>
          <Link
            href="/admin/menu"
            className="px-6 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition"
          >
            Отмена
          </Link>
        </div>
      </form>
    </div>
  )
}