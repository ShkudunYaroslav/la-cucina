import 'dotenv/config'
import { db } from './index'
import { menuItems, tables } from './schema'

async function seed() {
  console.log('🌱 Наполняем базу данных...')

  try {
    // ========== СТОЛИКИ ==========
    console.log('🪑 Создаём столики...')
    await db
      .insert(tables)
      .values([
        // Основной зал (9 столиков): 1, 2, 3, 4, 6, 7, 12, 13, 14
        { number: 1, capacity: 6, location: { x: 320, y: 500 }, section: 'main', shape: 'rectangle', width: 80, height: 50 },
        { number: 2, capacity: 4, location: { x: 240, y: 140 }, section: 'main', shape: 'circle' },
        { number: 3, capacity: 4, location: { x: 225, y: 260 }, section: 'main', shape: 'rectangle', width: 80, height: 50 },
        { number: 4, capacity: 4, location: { x: 350, y: 180 }, section: 'main', shape: 'rectangle', width: 80, height: 50 },
        { number: 6, capacity: 4, location: { x: 450, y: 400 }, section: 'main', shape: 'circle' },
        { number: 7, capacity: 4, location: { x: 475, y: 260 }, section: 'main', shape: 'rectangle', width: 80, height: 50 },
        { number: 12, capacity: 4, location: { x: 250, y: 400 }, section: 'main', shape: 'circle' },
        { number: 13, capacity: 4, location: { x: 665, y: 520 }, section: 'main', shape: 'circle' },
        { number: 14, capacity: 4, location: { x: 640, y: 380 }, section: 'main', shape: 'rectangle', width: 70, height: 50 },
        
        // VIP (2 столика): 5, 8
        { number: 5, capacity: 6, location: { x: 620, y: 185 }, section: 'vip', shape: 'rectangle', width: 120, height: 80 },
        { number: 8, capacity: 4, location: { x: 665, y: 135 }, section: 'vip', shape: 'circle' },
        
        // Терраса (3 столика): 9, 10, 11
        { number: 9, capacity: 4, location: { x: 113, y: 260 }, section: 'terrace', shape: 'circle' },
        { number: 10, capacity: 6, location: { x: 85, y: 315 }, section: 'terrace', shape: 'rectangle', width: 70, height: 50 },
        { number: 11, capacity: 6, location: { x: 85, y: 164 }, section: 'terrace', shape: 'rectangle', width: 70, height: 50 },
      ])
      .onConflictDoNothing()

    // ========== БЛЮДА ==========
    console.log('🍝 Создаём блюда...')
    await db
      .insert(menuItems)
      .values([
        {
          name: 'Bruschetta al Pomodoro',
          description: 'Хрустящие гренки с томатами, чесноком, базиликом и оливковым маслом',
          price: '450.00',
          category: 'antipasti',
          ingredients: ['хлеб', 'томаты', 'чеснок', 'базилик', 'оливковое масло'],
          allergens: ['глютен'],
          preparationTime: 10,
          isPopular: true,
        },
        {
          name: 'Spaghetti Carbonara',
          description: 'Классическая паста с гуанчиале, яйцом, пекорино романо и черным перцем',
          price: '890.00',
          category: 'primi',
          ingredients: ['спагетти', 'гуанчиале', 'яйцо', 'пекорино', 'черный перец'],
          allergens: ['глютен', 'яйца', 'молочные продукты'],
          preparationTime: 15,
          isPopular: true,
        },
        {
          name: 'Pizza Margherita',
          description: 'Традиционная пицца с томатным соусом, моцареллой и базиликом',
          price: '750.00',
          category: 'secondi',
          ingredients: ['мука', 'томатный соус', 'моцарелла', 'базилик', 'оливковое масло'],
          allergens: ['глютен', 'молочные продукты'],
          preparationTime: 20,
          isPopular: true,
        },
        {
          name: 'Tiramisù',
          description: 'Классический итальянский десерт с кофе, маскарпоне и какао',
          price: '450.00',
          category: 'dolci',
          ingredients: ['маскарпоне', 'савоярди', 'кофе', 'яйца', 'какао'],
          allergens: ['яйца', 'молочные продукты', 'глютен'],
          preparationTime: 0,
          isPopular: true,
        },
        {
          name: 'Aperol Spritz',
          description: 'Освежающий коктейль с аперолем, просекко и содовой',
          price: '550.00',
          category: 'bevande',
          ingredients: ['апероль', 'просекко', 'содовая', 'апельсин'],
          allergens: [],
          preparationTime: 5,
        },
        {
          name: 'Risotto ai Funghi',
          description: 'Кремовое ризотто с лесными грибами и пармезаном',
          price: '780.00',
          category: 'primi',
          ingredients: ['рис арборио', 'белые грибы', 'шампиньоны', 'пармезан', 'сливочное масло'],
          allergens: ['молочные продукты'],
          preparationTime: 25,
        },
        {
          name: 'Ossobuco alla Milanese',
          description: 'Тушеная телячья голяшка с шафрановым ризотто',
          price: '1200.00',
          category: 'secondi',
          ingredients: ['телятина', 'овощи', 'белое вино', 'шафран', 'рис'],
          allergens: [],
          preparationTime: 120,
        },
        {
          name: 'Vino della Casa (Rosso)',
          description: 'Бокал красного домашнего вина',
          price: '350.00',
          category: 'bevande',
          ingredients: ['красное вино'],
          allergens: ['сульфиты'],
          preparationTime: 2,
        },
      ])
      .onConflictDoNothing()

    console.log('✅ База данных наполнена!')
    console.log('🪑 Столиков: 14')
    console.log('   - Основной зал: 9 столиков')
    console.log('   - VIP зона: 2 столика')
    console.log('   - Терраса: 3 столика')
    console.log('🍝 Блюд: 8')

    process.exit(0)
  } catch (error) {
    console.error('❌ Ошибка при наполнении БД:', error)
    process.exit(1)
  }
}

seed()