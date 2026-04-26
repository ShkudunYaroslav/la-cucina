"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { trpc } from "@/lib/trpc/react"
import { toast } from "sonner"

const profileSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  phone: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  initialData: {
    name: string
    phone: string | null
    email: string
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  
  const { data: profile, refetch } = trpc.auth.getProfile.useQuery(undefined, {
    initialData: {
      id: "",
      name: initialData.name,
      email: initialData.email,
      phone: initialData.phone,
      role: "user",
      createdAt: new Date(),
    } as any,
  })
  
  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Профиль обновлён")
      refetch()
      setIsEditing(false)
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка при обновлении")
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || initialData.name,
      phone: profile?.phone || initialData.phone || "",
    },
  })

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  const onSubmit = (data: ProfileFormData) => {
    updateProfile.mutate(data)
  }

  return (
    <div className="bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-serif text-amber-400">Личные данные</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-amber-500 hover:text-amber-400 text-sm font-medium"
          >
            Редактировать
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="text-zinc-400 hover:text-zinc-300 text-sm"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="text-amber-500 hover:text-amber-400 text-sm font-medium"
            >
              {isSubmitting ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Имя
            </label>
            <input
              type="text"
              {...register("name")}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Телефон
            </label>
            <input
              type="tel"
              {...register("phone")}
              placeholder="+7 (999) 123-45-67"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={initialData.email}
              disabled
              className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-400 cursor-not-allowed"
            />
            <p className="text-xs text-zinc-500 mt-1">Email изменить нельзя</p>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-zinc-800">
            <span className="text-zinc-400">Имя</span>
            <span className="font-medium text-white">{profile?.name || initialData.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-800">
            <span className="text-zinc-400">Email</span>
            <span className="font-medium text-white">{initialData.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-800">
            <span className="text-zinc-400">Телефон</span>
            <span className="font-medium text-white">{profile?.phone || initialData.phone || "Не указан"}</span>
          </div>
        </div>
      )}
    </div>
  )
}