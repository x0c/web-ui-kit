import { Globe } from 'lucide-react'
import { Button } from '../primitives/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../primitives/dropdown-menu'

export interface LocaleOption {
  value: string
  label: string
}

/** Compact monochrome locale dropdown for AppTopbar or standalone surfaces. */
export function LocaleSwitcher({
  value,
  options,
  onChange,
  ariaLabel = 'Language',
  compactOnMobile = true,
}: {
  value: string
  options: readonly LocaleOption[]
  onChange: (value: string) => void
  ariaLabel?: string
  compactOnMobile?: boolean
}) {
  const active = options.find((o) => o.value === value)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={ariaLabel}
          className="h-8 gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground"
        >
          <Globe className="size-3.5" />
          <span className={compactOnMobile ? 'hidden sm:inline' : undefined}>
            {active?.label ?? value}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((opt) => (
            <DropdownMenuRadioItem key={opt.value} value={opt.value}>
              {opt.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Radio-group locale selector designed to live inside AppTopbar/AdminShell userMenuExtra. */
export function LocaleMenuGroup({
  value,
  options,
  onChange,
  label = 'Language',
}: {
  value: string
  options: readonly LocaleOption[]
  onChange: (value: string) => void
  label?: string
}) {
  return (
    <>
      <DropdownMenuLabel className="text-[11px] font-medium text-muted-foreground">
        {label}
      </DropdownMenuLabel>
      <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
        {options.map((opt) => (
          <DropdownMenuRadioItem key={opt.value} value={opt.value}>
            {opt.label}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </>
  )
}
