"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DatePickerProps {
  value?: Date | null
  onChange?: (date: Date | null) => void
  className?: string
  id?: string
  "aria-invalid"?: boolean
  "aria-describedby"?: string
}

const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  ({ value, onChange, className = "", id, ...props }, ref) => {
    const [selectedDay, setSelectedDay] = React.useState<string>("")
    const [selectedMonth, setSelectedMonth] = React.useState<string>("")
    const [selectedYear, setSelectedYear] = React.useState<string>("")
    
    // Use ref to store the current onChange to prevent infinite loops
    const onChangeRef = React.useRef(onChange)
    onChangeRef.current = onChange
    
    // Track if we're syncing from the value prop to prevent circular updates
    const isSyncingFromValue = React.useRef(false)

    // Generate arrays for dropdowns
    const days = Array.from({ length: 31 }, (_, i) => {
      const day = i + 1
      return { value: day.toString().padStart(2, '0'), label: day.toString() }
    })

    const months = [
      { value: "01", label: "January" },
      { value: "02", label: "February" },
      { value: "03", label: "March" },
      { value: "04", label: "April" },
      { value: "05", label: "May" },
      { value: "06", label: "June" },
      { value: "07", label: "July" },
      { value: "08", label: "August" },
      { value: "09", label: "September" },
      { value: "10", label: "October" },
      { value: "11", label: "November" },
      { value: "12", label: "December" },
    ]

    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => {
      const year = currentYear - i
      return { value: year.toString(), label: year.toString() }
    })

    // Sync state with value prop
    React.useEffect(() => {
      isSyncingFromValue.current = true
      
      if (value) {
        const day = value.getDate().toString().padStart(2, '0')
        const month = (value.getMonth() + 1).toString().padStart(2, '0')
        const year = value.getFullYear().toString()
        
        setSelectedDay(day)
        setSelectedMonth(month)
        setSelectedYear(year)
      } else {
        setSelectedDay("")
        setSelectedMonth("")
        setSelectedYear("")
      }
      
      // Reset the flag on next tick to allow normal updates
      setTimeout(() => {
        isSyncingFromValue.current = false
      }, 0)
    }, [value])

    // Auto-apply date when fields change
    React.useEffect(() => {
      // Skip if we're syncing from the value prop
      if (isSyncingFromValue.current) return
      
      if (selectedDay && selectedMonth && selectedYear) {
        const newDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, parseInt(selectedDay))
        
        // Validate the date is actually valid
        if (
          newDate.getDate() === parseInt(selectedDay) &&
          newDate.getMonth() === parseInt(selectedMonth) - 1 &&
          newDate.getFullYear() === parseInt(selectedYear)
        ) {
          onChangeRef.current?.(newDate)
        }
      } else {
        onChangeRef.current?.(null)
      }
    }, [selectedDay, selectedMonth, selectedYear])

    return (
      <div ref={ref} className={`grid grid-cols-3 gap-2 ${className}`} {...props}>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Day</Label>
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="DD" />
            </SelectTrigger>
            <SelectContent>
              {days.map((day) => (
                <SelectItem key={day.value} value={day.value}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Month</Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Year</Label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="YYYY" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  }
)

DatePicker.displayName = "DatePicker"

export { DatePicker }