import { MenuGrid } from "@/components/menu/MenuGrid"
import { CartSidebar } from "@/components/cart/CartSidebar"

export default function MenuPage() {
  return (
    <>
      <div className="container mx-auto py-12">
        <h1 className="text-4xl font-serif text-center mb-4">Наше меню</h1>
        <p className="text-center text-zinc-600 mb-12 max-w-2xl mx-auto">
          Аутентичные итальянские блюда, приготовленные с любовью и страстью
        </p>
        <MenuGrid showAddToCart />
      </div>
      <CartSidebar />
    </>
  )
}