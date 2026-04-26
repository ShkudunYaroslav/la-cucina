"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signUpSchema, type SignUpInput } from "@/lib/validators/auth"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import Link from "next/link"
import { PhoneInput } from "@/components/ui/PhoneInput"

export function SignUpForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      phone: "+7",
    },
  })

  const onSubmit = async (data: SignUpInput) => {
    setIsLoading(true)
    try {
      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        // @ts-expect-error - Better Auth принимает phone через additionalFields
        phone: data.phone && data.phone !== "+7" ? data.phone : undefined,
      })

      if (result.error) {
        toast.error(result.error.message || "Ошибка регистрации")
        return
      }

      toast.success("Регистрация успешна! Теперь вы можете войти.")
      router.push("/sign-in")
    } catch {
      toast.error("Произошла ошибка при регистрации")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Имя</label>
        <input
          {...register("name")}
          type="text"
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 text-white"
          placeholder="Иван Петров"
        />
        {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
        <input
          {...register("email")}
          type="email"
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 text-white"
          placeholder="your@email.com"
        />
        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Телефон (опционально)</label>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <PhoneInput
              value={field.value || "+7"}
              onChange={field.onChange}
              className="bg-zinc-800 border-zinc-700 text-white"
              error={!!errors.phone}
            />
          )}
        />
        {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Пароль</label>
        <input
          {...register("password")}
          type="password"
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 text-white"
          placeholder="••••••••"
        />
        {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-amber-400 transition disabled:opacity-50"
      >
        {isLoading ? "Регистрация..." : "Зарегистрироваться"}
      </button>

      <p className="text-center text-sm text-zinc-400">
        Уже есть аккаунт?{" "}
        <Link href="/sign-in" className="text-amber-500 hover:underline">
          Войти
        </Link>
      </p>
    </form>
  )
}