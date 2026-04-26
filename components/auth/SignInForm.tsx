"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signInSchema, type SignInInput } from "@/lib/validators/auth"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import Link from "next/link"

export function SignInForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInInput) => {
    setIsLoading(true)
    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      })

      if (result.error) {
        toast.error(result.error.message || "Ошибка входа")
        return
      }

      toast.success("Вход выполнен успешно!")
      router.push("/profile")
      router.refresh()
    } catch {
      toast.error("Произошла ошибка при входе")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          {...register("email")}
          type="email"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
          placeholder="your@email.com"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Пароль</label>
        <input
          {...register("password")}
          type="password"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
          placeholder="••••••••"
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
      >
        {isLoading ? "Вход..." : "Войти"}
      </button>

      <p className="text-center text-sm text-zinc-600">
        Нет аккаунта?{" "}
        <Link href="/sign-up" className="text-amber-600 hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </form>
  )
}