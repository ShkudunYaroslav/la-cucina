import Link from "next/link"
import { auth } from "@/server/auth"
import { headers } from "next/headers"
import { ArrowRight, LogIn, UserPlus, ChefHat, Wine, Users, MapPin, Phone, Clock, User } from "lucide-react"
import { ReviewsSection } from "@/components/review/ReviewsSection"
import { ReviewForm } from "@/components/review/ReviewForm"

export default async function HomePage() {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList,
  })

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-80 h-80 rounded-full bg-amber-600 blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-amber-700 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-amber-500 blur-3xl opacity-40"></div>
        </div>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative container mx-auto px-4 py-16 text-center z-10">
          <div className="inline-block mb-6">
            <span className="text-amber-400 text-sm uppercase tracking-widest bg-black/50 px-5 py-2 rounded-full backdrop-blur-sm border border-amber-600/30">
              Benvenuti a
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-serif font-bold mb-6 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">
              La Cucina
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-zinc-300 leading-relaxed">
            Аутентичная итальянская кухня в самом сердце города. <br className="hidden md:block" />
            Свежие ингредиенты, традиционные рецепты и атмосфера Италии.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/menu" className="group px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-2 hover:shadow-amber-600/20">
              Смотреть меню <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/reservation" className="px-8 py-4 bg-white/5 backdrop-blur-sm border-2 border-amber-600/50 text-white hover:bg-amber-600/20 hover:border-amber-500 rounded-full text-lg font-semibold transition-all transform hover:scale-105">
              Забронировать столик
            </Link>
          </div>
          <div className="inline-block bg-black/50 backdrop-blur-md rounded-3xl p-8 border border-amber-600/30 shadow-2xl">
            {session ? (
              <>
                <p className="text-amber-400 mb-2 text-sm uppercase tracking-widest text-center">С возвращением!</p>
                <p className="text-white text-lg font-medium mb-6 text-center">{session.user.name}</p>
                <Link href="/profile" className="group px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-500 hover:to-amber-400 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3">
                  <User size={20} /> Перейти в профиль
                </Link>
              </>
            ) : (
              <>
                <p className="text-zinc-300 mb-4 text-sm uppercase tracking-widest text-center">Уже были у нас?</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/sign-in" className="group px-8 py-4 bg-white/5 backdrop-blur-sm border-2 border-zinc-600 text-white hover:bg-amber-600/20 hover:border-amber-500 rounded-full font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-3">
                    <LogIn size={20} /> Войти в аккаунт
                  </Link>
                  <Link href="/sign-up" className="group px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-500 hover:to-amber-400 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3">
                    <UserPlus size={20} /> Зарегистрироваться
                  </Link>
                </div>
                <p className="text-zinc-400 text-sm mt-5 max-w-md text-center mx-auto">Создайте аккаунт, чтобы бронировать столики и сохранять любимые блюда</p>
              </>
            )}
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-7 h-12 border-2 border-amber-600/60 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-amber-500 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-amber-500 text-sm uppercase tracking-wider font-semibold">Почему мы</span>
            <h2 className="text-4xl md:text-5xl font-serif text-white mt-2 mb-4">Почему выбирают нас</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">Мы создаём не просто ресторан, а настоящее итальянское гостеприимство</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: ChefHat, title: "Аутентичные рецепты", desc: "Блюда по традиционным итальянским рецептам от шефа из Милана с 20-летним опытом", color: "from-amber-600/20 to-amber-800/20" },
              { icon: Wine, title: "Винная карта", desc: "Более 50 итальянских вин от известных виноделен Тосканы, Пьемонта и Венето", color: "from-red-600/20 to-red-800/20" },
              { icon: Users, title: "Атмосфера Италии", desc: "Уютный интерьер, живая музыка по вечерам и тёплый приём каждого гостя", color: "from-green-600/20 to-green-800/20" },
            ].map((feature, i) => (
              <div key={i} className="text-center p-8 bg-zinc-800/50 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-zinc-700">
                <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md border border-zinc-600`}>
                  <feature.icon size={32} className="text-amber-500" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Отзывы */}
      <section className="py-28 bg-gradient-to-b from-zinc-950 to-zinc-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-amber-500 text-sm uppercase tracking-wider font-semibold">Отзывы</span>
            <h2 className="text-4xl md:text-5xl font-serif text-white mt-2 mb-4">Что говорят наши гости</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">Реальные отзывы от наших посетителей</p>
          </div>
          <ReviewsSection />
        </div>
      </section>

      {/* Форма отзыва */}
      <section className="py-20 bg-zinc-900">
        <div className="container mx-auto px-4 max-w-2xl">
          <ReviewForm />
        </div>
      </section>

      {/* Популярные блюда */}
      <section className="py-28 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-amber-500 text-sm uppercase tracking-wider font-semibold">Меню</span>
            <h2 className="text-4xl md:text-5xl font-serif text-white mt-2 mb-4">Популярные блюда</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">То, что наши гости заказывают чаще всего</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { emoji: "🍝", name: "Spaghetti Carbonara", desc: "Паста с гуанчиале, яйцом и пекорино романо", price: "890 ₽", badge: "Хит" },
              { emoji: "🍕", name: "Pizza Margherita", desc: "Томатный соус, моцарелла, базилик", price: "750 ₽", badge: "Популярное" },
              { emoji: "🍰", name: "Tiramisu", desc: "Классический итальянский десерт", price: "450 ₽", badge: "Десерт" },
            ].map((dish, i) => (
              <div key={i} className="group bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-zinc-700 text-center relative overflow-hidden">
                <div className="absolute top-3 right-3">
                  <span className="text-xs bg-amber-600/20 text-amber-400 px-2 py-1 rounded-full font-medium border border-amber-600/30">{dish.badge}</span>
                </div>
                <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">{dish.emoji}</div>
                <h3 className="font-bold text-xl mb-2 text-white">{dish.name}</h3>
                <p className="text-zinc-400 text-sm mb-4">{dish.desc}</p>
                <p className="text-amber-500 font-bold text-2xl">{dish.price}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link href="/menu" className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-full hover:from-amber-500 hover:to-amber-400 transition shadow-xl text-lg font-semibold transform hover:scale-105">
              Смотреть всё меню <ArrowRight size={22} />
            </Link>
          </div>
        </div>
      </section>

      {/* Контакты */}
      <section className="py-20 bg-gradient-to-br from-zinc-950 to-zinc-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-zinc-800/50 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-zinc-700">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="p-4">
                <div className="w-14 h-14 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-600/30">
                  <MapPin className="text-amber-500" size={24} />
                </div>
                <h4 className="font-bold text-lg mb-2 text-white">Адрес</h4>
                <p className="text-zinc-400">ул. Итальянская, 15<br />Москва</p>
              </div>
              <div className="p-4">
                <div className="w-14 h-14 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-600/30">
                  <Phone className="text-amber-500" size={24} />
                </div>
                <h4 className="font-bold text-lg mb-2 text-white">Телефон</h4>
                <p className="text-zinc-400">+7 (999) 123-45-67</p>
              </div>
              <div className="p-4">
                <div className="w-14 h-14 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-600/30">
                  <Clock className="text-amber-500" size={24} />
                </div>
                <h4 className="font-bold text-lg mb-2 text-white">Часы работы</h4>
                <p className="text-zinc-400">Пн-Чт: 12:00-23:00<br />Пт-Сб: 12:00-00:00<br />Вс: 12:00-22:00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 bg-gradient-to-r from-zinc-900 via-zinc-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-64 h-64 bg-amber-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-700 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-serif mb-6 text-white">Забронируйте столик прямо сейчас</h2>
          <p className="text-xl text-zinc-300 mb-10 max-w-2xl mx-auto">Выберите удобное время и насладитесь незабываемым ужином в La Cucina</p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="/reservation" className="px-10 py-5 bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-500 hover:to-amber-400 rounded-full text-lg font-bold transition shadow-2xl transform hover:scale-105">
              Забронировать столик
            </Link>
            {!session && (
              <Link href="/sign-up" className="px-10 py-5 bg-transparent border-2 border-amber-600 text-white hover:bg-amber-600/20 rounded-full text-lg font-bold transition transform hover:scale-105">
                Зарегистрироваться
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Футер */}
      <footer className="bg-black text-white py-16 border-t border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-serif mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">La Cucina</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Аутентичная итальянская кухня с 2010 года. Мы создаём атмосферу Италии в самом сердце города.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-amber-500">Навигация</h4>
              <ul className="space-y-2 text-zinc-400">
                <li><Link href="/menu" className="hover:text-amber-400 transition">Меню</Link></li>
                <li><Link href="/reservation" className="hover:text-amber-400 transition">Бронирование</Link></li>
                <li><Link href="/profile" className="hover:text-amber-400 transition">Личный кабинет</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-amber-500">Контакты</h4>
              <ul className="space-y-2 text-zinc-400">
                <li>ул. Итальянская, 15</li>
                <li>+7 (999) 123-45-67</li>
                <li>info@lacucina.ru</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-amber-500">Часы работы</h4>
              <ul className="space-y-2 text-zinc-400">
                <li>Пн-Чт: 12:00 - 23:00</li>
                <li>Пт-Сб: 12:00 - 00:00</li>
                <li>Вс: 12:00 - 22:00</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-12 pt-8 text-center text-zinc-500 text-sm">
            © 2024 La Cucina. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  )
}