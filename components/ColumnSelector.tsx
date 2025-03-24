"use client"

import { LayoutGrid, Columns, LayoutList } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ColumnSelectorProps {
  currentColumns: number;
  onColumnChange: (columns: number) => void;
}

export default function ColumnSelector({
  currentColumns,
  onColumnChange,
}: ColumnSelectorProps) {
  const options = [
    { value: 1, icon: <LayoutList className="h-4 w-4" />, label: "1 Column" },
    { value: 2, icon: <Columns className="h-4 w-4" />, label: "2 Columns" },
    { value: 3, icon: <LayoutGrid className="h-4 w-4" />, label: "3 Columns" },
    { value: 4, icon: <LayoutGrid className="h-4 w-4" />, label: "4 Columns" },
  ]

  return (
    <div className="flex space-x-2">
      {options.map((option) => (
        <Button
          key={option.value}
          variant={currentColumns === option.value ? "default" : "outline"}
          size="sm"
          onClick={() => onColumnChange(option.value)}
          title={option.label}
          aria-label={option.label}
        >
          {option.icon}
          <span className="sr-only">{option.label}</span>
        </Button>
      ))}
    </div>
  )
}
