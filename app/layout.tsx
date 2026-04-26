import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { TRPCProvider } from "@/lib/trpc/react"
import { Toaster } from "sonner"

const inter = Inter({ 
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
})

const playfair = Playfair_Display({ 
  subsets: ["latin", "cyrillic"],
  variable: "--font-serif",
})

export const metadata: Metadata = {
  title: "La Cucina | Итальянский ресторан",
  description: "Аутентичная итальянская кухня. Забронируйте столик онлайн.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className={`${inter.variable} ${playfair.variable} dark`}>
      <body className="font-sans antialiased bg-zinc-950 text-zinc-100">
        <TRPCProvider>
          {children}
          <Toaster position="top-right" richColors />
        </TRPCProvider>
      </body>
    </html>
  )
}