"use client"

import dynamic from 'next/dynamic'

const ReservationMap = dynamic(
  () => import('./ReservationMap').then((mod) => mod.ReservationMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] flex items-center justify-center bg-zinc-100 rounded-lg">
        <p className="text-zinc-600">Загрузка карты зала...</p>
      </div>
    ),
  }
)

interface ReservationMapWrapperProps {
  onSelectTable?: (tableId: string) => void
}

export function ReservationMapWrapper({ onSelectTable }: ReservationMapWrapperProps) {
  return <ReservationMap onSelectTable={onSelectTable} />
}