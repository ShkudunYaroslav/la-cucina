"use client"

import { trpc } from "@/lib/trpc/react"
import { Download } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

const statusLabels: Record<string, string> = {
  pending: "Ожидает",
  confirmed: "Подтверждено",
  arrived: "Гость прибыл",
  cancelled: "Отменено",
  completed: "Завершено",
}

export function ExportButton() {
  const { data: reservations, isLoading } = trpc.reservation.getAll.useQuery()

  const handleExport = () => {
    if (!reservations || reservations.length === 0) {
      toast.error("Нет данных для экспорта")
      return
    }

    const data = reservations.map((r: any, index: number) => ({
      "№": index + 1,
      "Гость": r.user?.name || "—",
      "Телефон": r.user?.phone || "—",
      "Email": r.user?.email || "—",
      "Дата": r.date ? format(new Date(r.date), "dd.MM.yyyy") : "—",
      "Время": r.time?.slice(0, 5) || "—",
      "Столик": r.table?.number || "—",
      "Гостей": r.guestCount,
      "Длительность (мин)": r.duration,
      "Пожелания": r.specialRequests || "—",
      "Статус": statusLabels[r.status] || r.status,
      "Создано": r.createdAt ? format(new Date(r.createdAt), "dd.MM.yyyy HH:mm") : "—",
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Бронирования")

    const colWidths = [
      { wch: 5 }, { wch: 20 }, { wch: 18 }, { wch: 25 },
      { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
      { wch: 18 }, { wch: 30 }, { wch: 18 }, { wch: 18 },
    ]
    ws["!cols"] = colWidths

    const fileName = `Бронирования_La_Cucina_${format(new Date(), "dd.MM.yyyy")}.xlsx`
    XLSX.writeFile(wb, fileName)
    toast.success("Отчёт скачан!")
  }

  return (
    <button
      onClick={handleExport}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
    >
      <Download size={18} />
      {isLoading ? "Загрузка..." : "Экспорт в Excel"}
    </button>
  )
}