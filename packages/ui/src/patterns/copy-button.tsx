import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../lib/utils'
import { Button } from '../primitives/button'
import { toast } from './toaster'

export async function copyText(text: string, copyFailedLabel = 'Unable to copy to clipboard'): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    toast.error(copyFailedLabel)
    return false
  }
}

/** Icon button that copies `value` and confirms with a brief check mark. */
export function CopyButton({
  value,
  label = 'Copy',
  copiedLabel = 'Copied',
  copyFailedLabel,
  className,
  showLabel = false,
}: {
  value: string
  label?: string
  copiedLabel?: string
  copyFailedLabel?: string
  className?: string
  showLabel?: boolean
}) {
  const [done, setDone] = useState(false)
  return (
    <Button
      type="button"
      variant="ghost"
      size={showLabel ? 'sm' : 'icon'}
      className={cn(!showLabel && 'size-8', className)}
      aria-label={label}
      onClick={async () => {
        if (await copyText(value, copyFailedLabel)) {
          setDone(true)
          setTimeout(() => setDone(false), 1400)
        }
      }}
    >
      {done ? <Check className="text-success" /> : <Copy />}
      {showLabel && (done ? copiedLabel : label)}
    </Button>
  )
}
