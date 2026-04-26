# Технический контекст La Cucina

## Команды запуска
- pnpm dev — запуск сервера разработки
- pnpm db:push — применить изменения схемы в БД
- pnpm db:seed — заполнить БД тестовыми данными
- pnpm db:studio — запуск Drizzle Studio

## Тёмная тема
- Фон: bg-zinc-950, bg-zinc-900
- Карточки: bg-zinc-900 border border-zinc-800
- Текст: text-white, text-zinc-300, text-zinc-400
- Акценты: text-amber-400, text-amber-500
- Поля ввода: bg-zinc-800 border-zinc-700 text-white

## Интеграция Better Auth с Drizzle
- Адаптер: drizzleAdapter
- Плагины: admin(), username()
- Роли: user, admin, waiter