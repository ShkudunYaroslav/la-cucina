// @ts-nocheck
"use client"

import { trpc } from "@/lib/trpc/react"
import { useState } from "react"

interface Table {
  id: string
  number: number
  capacity: number
  location: { x: number; y: number }
  section: string | null
  shape: string
  width?: number | null
  height?: number | null
  isActive: boolean
}

interface FloorPlanProps {
  onSelectTable?: (tableId: string) => void
}

export function FloorPlan({ onSelectTable }: FloorPlanProps) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [hoveredTable, setHoveredTable] = useState<string | null>(null)
  const { data: tables, isLoading } = trpc.table.getAll.useQuery()

  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-stone-50 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
          <p className="text-zinc-600 mt-4 text-lg">Загрузка схемы зала...</p>
        </div>
      </div>
    )
  }

  const handleTableClick = (tableId: string) => {
    setSelectedTable(tableId)
    onSelectTable?.(tableId)
  }

  const getTableColor = (section: string | null) => {
    switch (section) {
      case "vip": return "#8B0000"
      case "terrace": return "#2E7D32"
      default: return "#8B4513"
    }
  }

  const selectedTableData = tables?.find((t: Table) => t.id === selectedTable)

  return (
    <div className="bg-gradient-to-br from-amber-50 via-stone-100 to-amber-50 rounded-2xl p-8 shadow-2xl border border-amber-200">
      <div className="relative w-full max-w-6xl mx-auto">
        
        {/* Заголовок */}
        <div className="text-center mb-6">
          <h3 className="text-3xl font-serif text-amber-900 tracking-wide">La Cucina</h3>
          <p className="text-sm text-zinc-600 mt-1 uppercase tracking-wider">План рассадки</p>
          
          {/* Легенда */}
          <div className="flex justify-center gap-8 mt-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-amber-800 shadow-sm"></div>
              <span className="text-zinc-700">Основной зал</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-red-900 shadow-sm"></div>
              <span className="text-zinc-700">VIP зона</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-green-800 shadow-sm"></div>
              <span className="text-zinc-700">Летняя терраса</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-white ring-2 ring-amber-500 bg-amber-600"></div>
              <span className="text-zinc-700">Выбрано</span>
            </div>
          </div>
        </div>

        {/* Основная SVG схема */}
        <div className="bg-[#FDF8F5] rounded-2xl shadow-inner p-6 border border-amber-300">
          <svg 
            viewBox="0 0 900 650" 
            className="w-full h-auto"
            style={{ minHeight: "550px" }}
          >
            <defs>
              {/* Градиенты */}
              <linearGradient id="wallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E8D5C4"/>
                <stop offset="100%" stopColor="#D4BAA5"/>
              </linearGradient>
              
              <linearGradient id="floorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDF8F5"/>
                <stop offset="100%" stopColor="#F5EDE5"/>
              </linearGradient>
              
              <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#5C3A21"/>
                <stop offset="100%" stopColor="#3E2515"/>
              </linearGradient>
              
              <linearGradient id="tableMain" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A0522D"/>
                <stop offset="100%" stopColor="#8B4513"/>
              </linearGradient>
              
              <linearGradient id="tableVip" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#B22222"/>
                <stop offset="100%" stopColor="#8B0000"/>
              </linearGradient>
              
              <linearGradient id="tableTerrace" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3CB371"/>
                <stop offset="100%" stopColor="#2E7D32"/>
              </linearGradient>

              {/* Тени */}
              <filter id="shadow-sm">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.1"/>
              </filter>
              <filter id="shadow-md">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.15"/>
              </filter>
              <filter id="shadow-lg">
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.2"/>
              </filter>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              {/* Текстура паркета */}
              <pattern id="parquet" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)">
                <rect width="40" height="40" fill="#FDF8F5"/>
                <rect width="18" height="18" fill="#F5EDE5" x="0" y="0"/>
                <rect width="18" height="18" fill="#F5EDE5" x="20" y="20"/>
              </pattern>
            </defs>

            {/* ========== ПОЛ ========== */}
            <rect x="30" y="30" width="840" height="590" fill="url(#parquet)" rx="8"/>

            {/* ========== СТЕНЫ ========== */}
            <rect x="30" y="30" width="840" height="590" fill="none" stroke="url(#wallGradient)" strokeWidth="12" rx="8"/>
            <rect x="36" y="36" width="828" height="578" fill="none" stroke="#C4A882" strokeWidth="2" rx="6" opacity="0.5"/>

            {/* ========== ВХОД ========== */}
            <g filter="url(#shadow-md)">
              <rect x="370" y="20" width="160" height="28" fill="#5C3A21" rx="8"/>
              <rect x="380" y="26" width="140" height="16" fill="none" stroke="#D4BAA5" strokeWidth="1.5" rx="4"/>
              <text x="450" y="38" textAnchor="middle" fontSize="13" fill="#FDF8F5" fontWeight="bold" letterSpacing="2">ГЛАВНЫЙ ВХОД</text>
            </g>

            {/* ========== КОЛОННЫ ========== */}
            {[100, 250, 400, 550, 700].map((x, i) => (
              <g key={i} filter="url(#shadow-sm)">
                <rect x={x} y="50" width="30" height="30" fill="#D4BAA5" rx="4"/>
                <rect x={x+2} y="52" width="26" height="26" fill="#E8D5C4" rx="3"/>
              </g>
            ))}

            {/* ========== БАРНАЯ СТОЙКА ========== */}
            <g filter="url(#shadow-lg)">
              <rect x="750" y="100" width="90" height="220" fill="url(#barGradient)" rx="8"/>
              <rect x="758" y="108" width="74" height="204" fill="none" stroke="#D4BAA5" strokeWidth="1.5" rx="4"/>
              
              {/* Бутылки на баре */}
              {[762, 774, 786, 798, 810].map((x, i) => (
                <rect key={i} x={x} y={115} width="8" height="20" fill={i % 2 ? "#2E7D32" : "#8B0000"} rx="2" opacity="0.8"/>
              ))}
              
              {/* Бокалы */}
              {[770, 790, 810].map((x, i) => (
                <g key={i}>
                  <path d={`M${x-4} 145 L${x-4} 155 Q${x-4} 160 ${x} 160 Q${x+4} 160 ${x+4} 155 L${x+4} 145 Z`} fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6"/>
                </g>
              ))}
              
              <text x="795" y="280" textAnchor="middle" fontSize="14" fill="#FDF8F5" fontWeight="bold">BAR</text>
            </g>

            {/* Барные стулья */}
            {[770, 795, 820].map((x, i) => (
              <g key={i} filter="url(#shadow-sm)">
                <circle cx={x} cy="330" r="8" fill="#4A3728"/>
                <circle cx={x} cy="330" r="4" fill="#6B4C3B"/>
              </g>
            ))}

            {/* ========== ОТКРЫТАЯ КУХНЯ ========== */}
            <g filter="url(#shadow-md)">
              <rect x="50" y="460" width="150" height="140" fill="#E8D5C4" rx="8"/>
              <rect x="58" y="468" width="134" height="124" fill="none" stroke="#C4A882" strokeWidth="1.5" rx="4" strokeDasharray="4,4"/>
              
              {/* Плита */}
              <rect x="70" y="480" width="50" height="30" fill="#4A4A4A" rx="4"/>
              {[75, 85, 95, 105, 115].map((x, i) => (
                <circle key={i} cx={x} cy={495} r="4" fill="#FF4500" opacity="0.7"/>
              ))}
              
              {/* Рабочий стол */}
              <rect x="140" y="480" width="45" height="60" fill="#A0522D" rx="4"/>
              
              {/* Раковина */}
              <rect x="70" y="530" width="40" height="25" fill="#B0C4DE" rx="4"/>
              <circle cx="90" cy="542" r="6" fill="#87CEEB"/>
              
              <text x="125" y="580" textAnchor="middle" fontSize="12" fill="#5C3A21" fontWeight="bold">CUCINA</text>
            </g>

            {/* ========== ЗОНА VIP ========== */}
            <g filter="url(#shadow-sm)">
              <rect x="590" y="90" width="150" height="180" fill="none" stroke="#8B0000" strokeWidth="1.5" rx="8" strokeDasharray="6,4"/>
              <text x="675" y="105" textAnchor="middle" fontSize="12" fill="#8B0000" fontWeight="bold">VIP</text>
            </g>

            {/* ========== ТЕРРАСА ========== */}
            <g filter="url(#shadow-sm)">
              <rect x="50" y="80" width="120" height="350" fill="none" stroke="#2E7D32" strokeWidth="1.5" rx="8" strokeDasharray="6,4"/>
              <text x="110" y="105" textAnchor="middle" fontSize="12" fill="#2E7D32" fontWeight="bold">ТЕРРАСА</text>
              
              {/* Растения в горшках */}
              <circle cx="75" cy="130" r="14" fill="#228B22" opacity="0.5"/>
              <rect x="68" y="142" width="14" height="10" fill="#8B4513" rx="2"/>
              
              <circle cx="145" cy="130" r="14" fill="#228B22" opacity="0.5"/>
              <rect x="138" y="142" width="14" height="10" fill="#8B4513" rx="2"/>
              
              <circle cx="75" cy="380" r="14" fill="#228B22" opacity="0.5"/>
              <rect x="68" y="392" width="14" height="10" fill="#8B4513" rx="2"/>
              
              <circle cx="145" cy="380" r="14" fill="#228B22" opacity="0.5"/>
              <rect x="138" y="392" width="14" height="10" fill="#8B4513" rx="2"/>
            </g>

            {/* ========== ДЕКОР (люстры) ========== */}
            <g opacity="0.4">
              <circle cx="300" cy="100" r="15" fill="none" stroke="#D4BAA5" strokeWidth="2"/>
              <circle cx="300" cy="100" r="6" fill="#D4BAA5"/>
              <line x1="300" y1="85" x2="300" y2="70" stroke="#D4BAA5" strokeWidth="1.5"/>
              
              <circle cx="500" cy="100" r="15" fill="none" stroke="#D4BAA5" strokeWidth="2"/>
              <circle cx="500" cy="100" r="6" fill="#D4BAA5"/>
              <line x1="500" y1="85" x2="500" y2="70" stroke="#D4BAA5" strokeWidth="1.5"/>
            </g>

            {/* ========== СТОЛИКИ ========== */}
            {(tables as Table[])?.map((table: Table) => {
              const isSelected = selectedTable === table.id
              const isHovered = hoveredTable === table.id
              const baseColor = getTableColor(table.section)
              const x = table.location.x
              const y = table.location.y
              
              // Прямоугольные столы
              if (table.shape === "rectangle") {
                const w = (table.width || 70) * 0.8
                const h = (table.height || 50) * 0.8
                return (
                  <g 
                    key={table.id} 
                    onClick={() => handleTableClick(table.id)}
                    onMouseEnter={() => setHoveredTable(table.id)}
                    onMouseLeave={() => setHoveredTable(null)}
                    className="cursor-pointer"
                    style={{ transition: 'all 0.2s ease' }}
                  >
                    {/* Стулья */}
                    <rect x={x-10} y={y+5} width="8" height="14" fill="#6B4C3B" rx="3" opacity="0.8"/>
                    <rect x={x+w+2} y={y+5} width="8" height="14" fill="#6B4C3B" rx="3" opacity="0.8"/>
                    <rect x={x-10} y={y+h-19} width="8" height="14" fill="#6B4C3B" rx="3" opacity="0.8"/>
                    <rect x={x+w+2} y={y+h-19} width="8" height="14" fill="#6B4C3B" rx="3" opacity="0.8"/>
                    <rect x={x+5} y={y-8} width="8" height="14" fill="#6B4C3B" rx="3" opacity="0.8" transform={`rotate(90, ${x+w/2}, ${y+h/2})`}/>
                    <rect x={x+w-13} y={y-8} width="8" height="14" fill="#6B4C3B" rx="3" opacity="0.8" transform={`rotate(90, ${x+w/2}, ${y+h/2})`}/>
                    
                    {/* Стол */}
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      fill={isSelected ? "#D4A017" : baseColor}
                      stroke={isSelected ? "#FFFFFF" : isHovered ? "#FFD700" : baseColor}
                      strokeWidth={isSelected ? 3 : 2}
                      rx="6"
                      filter={isSelected ? "url(#glow)" : "url(#shadow-md)"}
                      opacity={isHovered && !isSelected ? 0.9 : 1}
                    />
                    
                    {/* Приборы */}
                    <line x1={x+8} y1={y+h/2-3} x2={x+20} y2={y+h/2-3} stroke="#C0C0C0" strokeWidth="1.5"/>
                    <line x1={x+8} y1={y+h/2+3} x2={x+20} y2={y+h/2+3} stroke="#C0C0C0" strokeWidth="1.5"/>
                    
                    {/* Номер столика */}
                    <text
                      x={x + w / 2}
                      y={y + h / 2 + 4}
                      textAnchor="middle"
                      fontSize="14"
                      fill="white"
                      fontWeight="bold"
                    >
                      {table.number}
                    </text>
                  </g>
                )
              }
              
              // Круглые столы
              return (
                <g 
                  key={table.id} 
                  onClick={() => handleTableClick(table.id)}
                  onMouseEnter={() => setHoveredTable(table.id)}
                  onMouseLeave={() => setHoveredTable(null)}
                  className="cursor-pointer"
                  style={{ transition: 'all 0.2s ease' }}
                >
                  {/* Стулья */}
                  <circle cx={x-22} cy={y-12} r="7" fill="#6B4C3B" opacity="0.8"/>
                  <circle cx={x+22} cy={y-12} r="7" fill="#6B4C3B" opacity="0.8"/>
                  <circle cx={x-22} cy={y+12} r="7" fill="#6B4C3B" opacity="0.8"/>
                  <circle cx={x+22} cy={y+12} r="7" fill="#6B4C3B" opacity="0.8"/>
                  
                  {/* Стол */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 26 : 24}
                    fill={isSelected ? "#D4A017" : baseColor}
                    stroke={isSelected ? "#FFFFFF" : isHovered ? "#FFD700" : baseColor}
                    strokeWidth={isSelected ? 3 : 2}
                    filter={isSelected ? "url(#glow)" : "url(#shadow-md)"}
                    opacity={isHovered && !isSelected ? 0.9 : 1}
                  />
                  
                  {/* Тарелка */}
                  <circle cx={x} cy={y} r="10" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.5"/>
                  <circle cx={x} cy={y} r="5" fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3"/>
                  
                  {/* Номер столика */}
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fontSize="14"
                    fill="white"
                    fontWeight="bold"
                  >
                    {table.number}
                  </text>
                </g>
              )
            })}

            {/* ========== МАСШТАБНАЯ ЛИНЕЙКА ========== */}
            <g opacity="0.4">
              <line x1="750" y1="610" x2="850" y2="610" stroke="#5C3A21" strokeWidth="2"/>
              <line x1="750" y1="605" x2="750" y2="615" stroke="#5C3A21" strokeWidth="2"/>
              <line x1="850" y1="605" x2="850" y2="615" stroke="#5C3A21" strokeWidth="2"/>
              <text x="800" y="625" textAnchor="middle" fontSize="10" fill="#5C3A21">2 метра</text>
            </g>
          </svg>
        </div>

        {/* Информация о выбранном столике */}
        {selectedTableData && (
          <div className="mt-6 p-5 bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 rounded-xl border border-amber-300 shadow-lg">
            <div className="flex items-center justify-center gap-4">
              <span className="text-3xl">🍽️</span>
              <div className="text-center">
                <p className="text-amber-900 font-semibold text-lg">
                  Столик №{selectedTableData.number}
                </p>
                <p className="text-zinc-700 text-sm">
                  {selectedTableData.capacity} {selectedTableData.capacity === 1 ? 'место' : 
                    selectedTableData.capacity < 5 ? 'места' : 'мест'} • {
                    selectedTableData.section === 'vip' ? 'VIP зона' : 
                    selectedTableData.section === 'terrace' ? 'Летняя терраса' : 
                    'Основной зал'
                  }
                </p>
              </div>
              <span className="text-3xl">🍷</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}