"use client"

import { useCart } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"
import { X, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"

export function CartSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCart()
  const router = useRouter()
  const { data: session } = useSession()
  
  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  // Ждём монтирования на клиенте
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleCheckout = () => {
    if (!session) {
      toast.error("Для оформления заказа необходимо войти в аккаунт")
      router.push("/sign-in")
      return
    }
    
    if (items.length === 0) {
      toast.error("Корзина пуста")
      return
    }
    
    sessionStorage.setItem("pendingCart", JSON.stringify(items))
    setIsOpen(false)
    router.push("/reservation?withCart=true")
  }

  // Не рендерим на сервере, чтобы избежать гидратации
  if (!isMounted) {
    return null
  }

  return (
    <>
      {/* Кнопка открытия корзины */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-4 z-40 bg-amber-600 text-white p-4 rounded-full shadow-lg hover:bg-amber-700 transition flex items-center gap-2"
      >
        <ShoppingCart size={24} />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {/* Боковая панель корзины */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-serif text-amber-900 flex items-center gap-2">
                <ShoppingCart size={20} />
                Корзина
                {totalItems > 0 && (
                  <span className="text-sm font-normal text-zinc-500">
                    ({totalItems} {totalItems === 1 ? "товар" : totalItems < 5 ? "товара" : "товаров"})
                  </span>
                )}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-zinc-100 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart size={48} className="mx-auto text-zinc-300 mb-4" />
                  <p className="text-zinc-500 mb-4">Корзина пуста</p>
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      router.push("/menu")
                    }}
                    className="text-amber-600 hover:underline"
                  >
                    Перейти в меню
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-zinc-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-zinc-900">{item.name}</p>
                        <p className="text-sm text-amber-700">{formatPrice(item.price)}</p>
                        {item.notes && (
                          <p className="text-xs text-zinc-500 mt-1">{item.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-zinc-200 rounded transition"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-zinc-200 rounded transition"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded ml-2 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 border-t bg-white">
                <div className="flex justify-between mb-4">
                  <span className="font-medium text-zinc-700">Итого:</span>
                  <span className="font-bold text-amber-700 text-lg">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={clearCart}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                  >
                    Очистить
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                  >
                    Оформить заказ
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}