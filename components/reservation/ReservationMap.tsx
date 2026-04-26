"use client"

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon, LatLngExpression } from 'leaflet'
import { useState } from 'react'
import { trpc } from '@/lib/trpc/react'
import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// Тип для столика
interface Table {
  id: string
  number: number
  capacity: number
  location: { x: number; y: number }
  section: string
  isActive: boolean
}

// Иконка для столика
const tableIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2983/2983862.png',
  iconSize: [32, 32],
})

interface ReservationMapProps {
  onSelectTable?: (tableId: string) => void
}

export function ReservationMap({ onSelectTable }: ReservationMapProps) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  
  // @ts-ignore - временно игнорируем ошибку типов tRPC
  const { data: tables, isLoading } = trpc.table.getAll.useQuery()
  
  const { data: session } = useSession()
  const router = useRouter()

  // Координаты центра карты (пример: центр Москвы)
  const center: LatLngExpression = [55.7558, 37.6173]

  const handleReserve = () => {
    if (!session) {
      toast.error('Пожалуйста, войдите в аккаунт')
      router.push('/sign-in')
      return
    }
    if (selectedTable && onSelectTable) {
      onSelectTable(selectedTable)
    }
  }

  if (isLoading) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-zinc-100 rounded-lg">
        <p className="text-zinc-600">Загрузка карты зала...</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <MapContainer
        center={center}
        zoom={17}
        style={{ height: '500px', width: '100%' }}
        className="rounded-lg z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {(tables as Table[])?.map((table: Table) => (
          <Marker
            key={table.id}
            position={[table.location.x, table.location.y]}
            icon={tableIcon}
            eventHandlers={{
              click: () => setSelectedTable(table.id),
            }}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Столик №{table.number}</p>
                <p>Вместимость: {table.capacity} чел.</p>
                <p className="text-sm text-zinc-600 capitalize">{table.section}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {selectedTable && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg z-10 border">
          <p className="mb-3">
            Выбран столик №{tables?.find((t: Table) => t.id === selectedTable)?.number}
          </p>
          <button
            onClick={handleReserve}
            className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            Забронировать
          </button>
        </div>
      )}
    </div>
  )
}