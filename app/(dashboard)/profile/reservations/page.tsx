import { auth } from "@/server/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { ReservationsList } from "@/components/profile/ReservationsList"

export default async function ReservationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <div>
      <ReservationsList />
    </div>
  )
}