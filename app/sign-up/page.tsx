import { SignUpForm } from "@/components/auth/SignUpForm"

export default function SignUpPage() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <h1 className="text-3xl font-serif text-center mb-8">Регистрация</h1>
      <SignUpForm />
    </div>
  )
}