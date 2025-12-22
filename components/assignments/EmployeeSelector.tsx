'use client'

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Profile } from "@/types/db"

interface EmployeeSelectorProps {
    employees: Profile[]
    selectedId?: string
    onSelect: (id: string) => void
    tenantId: string // Ensure tenantId is passed
}

export function EmployeeSelector({ employees: initialEmployees, selectedId, onSelect, tenantId }: EmployeeSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(selectedId || "")
  const [employees, setEmployees] = React.useState<Profile[]>(initialEmployees)
  const [query, setQuery] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  // Sync prop changes
  React.useEffect(() => {
      if (selectedId) setValue(selectedId)
  }, [selectedId])

  // Real-time search effect
  React.useEffect(() => {
    const search = async () => {
        if (!query) {
            setEmployees(initialEmployees)
            return
        }
        
        setLoading(true)
        try {
            const results = await searchEmployees(query, tenantId)
            setEmployees(results)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [query, initialEmployees, tenantId])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between"
        >
          {value
            ? (employees.find((emp) => emp.id === value)?.full_name || initialEmployees.find((emp) => emp.id === value)?.full_name || "Select employee...")
            : "Select employee..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search employee..." onValueChange={setQuery} />
           <CommandList>
            {loading && <div className="py-6 text-center text-sm text-muted-foreground">Searching...</div>}
            {!loading && employees.length === 0 && <CommandEmpty>No employee found.</CommandEmpty>}
            <CommandGroup>
                {employees.map((emp) => (
                <CommandItem
                    key={emp.id}
                    value={emp.id} // Use ID as value since we handle filtering manually
                    onSelect={(currentValue) => {
                        onSelect(currentValue)
                        setValue(currentValue)
                        setOpen(false)
                    }}
                >
                    <Check
                    className={cn(
                        "mr-2 h-4 w-4",
                        value === emp.id ? "opacity-100" : "opacity-0"
                    )}
                    />
                    {emp.full_name}
                    <span className="ml-2 text-xs text-muted-foreground truncate">{emp.email}</span>
                </CommandItem>
                ))}
          </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Import server action at top of file needed? No, importing it directly inside component file works if it's 'use client'.
// But we need to import `searchEmployees`.
import { searchEmployees } from '@/app/t/[tenantSlug]/admin/assignments/actions'
