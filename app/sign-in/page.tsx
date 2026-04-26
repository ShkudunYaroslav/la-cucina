import { SignInForm } from "@/components/auth/SignInForm"

export default function SignInPage() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <h1 className="text-3xl font-serif text-center mb-8">Вход в аккаунт</h1>
      <SignInForm />
    </div>
  )
}