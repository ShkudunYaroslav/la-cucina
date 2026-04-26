"use client"

import { forwardRef } from "react"

interface PhoneInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  error?: boolean
  disabled?: boolean
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value = "", onChange, placeholder = "+7 (___) ___-__-__", className = "", error, disabled, ...rest }, ref) => {
    
    const formatPhone = (input: string): string => {
      // Убираем всё, кроме цифр
      let digits = input.replace(/\D/g, "")
      
      // Если начинается с 8, заменяем на 7
      if (digits.startsWith("8")) {
        digits = "7" + digits.slice(1)
      }
      
      // Если нет кода страны, добавляем 7
      if (digits.length > 0 && !digits.startsWith("7")) {
        digits = "7" + digits
      }
      
      // Ограничиваем 11 цифрами (7 + 10)
      digits = digits.slice(0, 11)
      
      // Форматируем
      let formatted = "+7"
      if (digits.length > 1) {
        formatted += " (" + digits.slice(1, 4)
        if (digits.length >= 5) {
          formatted += ") " + digits.slice(4, 7)
          if (digits.length >= 8) {
            formatted += "-" + digits.slice(7, 9)
            if (digits.length >= 10) {
              formatted += "-" + digits.slice(9, 11)
            }
          }
        }
      }
      
      return formatted
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value
      const formatted = formatPhone(input)
      
      if (onChange) {
        onChange(formatted)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Позволяем Backspace, Delete, стрелки
      const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"]
      if (allowedKeys.includes(e.key)) return
      
      // Блокируем нецифровые символы
      if (!/\d/.test(e.key)) {
        e.preventDefault()
      }
    }

    return (
      <input
        ref={ref}
        type="tel"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition ${
          error ? "border-red-500 focus:ring-red-500" : "border-zinc-300"
        } ${className}`}
        disabled={disabled}
        maxLength={18}
        {...rest}
      />
    )
  }
)

PhoneInput.displayName = "PhoneInput"