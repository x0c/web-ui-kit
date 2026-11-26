import { Command } from 'cmdk'
import type { LucideIcon } from 'lucide-react'
import { Search } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { cn } from '../lib/utils'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../primitives/dialog'

export interface CommandAction {
  id: string
  label: string
  group?: string
  icon?: LucideIcon
  keywords?: string[]
  shortcut?: string
  onSelect: () => void
}

export interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: CommandAction[]
  placeholder?: string
  emptyLabel?: string
  title?: string
}

/** Keyboard-first command palette (⌘K / Ctrl+K) wrapping cmdk in Flat Monochrome surfaces. */
export function CommandPalette({
  open,
  onOpenChange,
  items,
  placeholder = 'Jump to section or action…',
  emptyLabel = 'No matching commands.',
  title = 'Command Palette',
}: CommandPaletteProps) {
  const stateRef = useRef({ open, onOpenChange })

  useEffect(() => {
    stateRef.current = { open, onOpenChange }
  }, [open, onOpenChange])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.isComposing || e.altKey) return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        stateRef.current.onOpenChange(!stateRef.current.open)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const groups = new Map<string, CommandAction[]>()
  for (const item of items) {
    const g = item.group ?? 'Navigation'
    const list = groups.get(g) ?? []
    list.push(item)
    groups.set(g, list)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:max-w-[500px]">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{placeholder}</DialogDescription>
        <Command className="flex h-full w-full flex-col bg-popover text-popover-foreground">
          <div className="flex h-11 items-center gap-2.5 border-b border-border px-3.5">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Command.Input
              autoFocus
              placeholder={placeholder}
              className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
            />
          </div>
          <Command.List className="max-h-[320px] overflow-y-auto p-1.5">
            <Command.Empty className="py-8 text-center text-xs text-muted-foreground">
              {emptyLabel}
            </Command.Empty>
            {Array.from(groups.entries()).map(([group, groupItems]) => (
              <Command.Group
                key={group}
                heading={group}
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {groupItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Command.Item
                      key={item.id}
                      value={[item.label, ...(item.keywords ?? [])].join(' ')}
                      onSelect={() => {
                        onOpenChange(false)
                        item.onSelect()
                      }}
                      className={cn(
                        'flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] outline-none select-none',
                        'data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground',
                      )}
                    >
                      {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.shortcut && (
                        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                          {item.shortcut}
                        </kbd>
                      )}
                    </Command.Item>
                  )
                })}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
