import { auth } from "@/server/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/profile/ProfileForm"

export default async function ProfileInfoPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <div className="max-w-2xl">
      <ProfileForm 
        initialData={{
          name: session.user.name,
          phone: session.user.phone || null,
          email: session.user.email,
        }}
      />
    </div>
  )
}