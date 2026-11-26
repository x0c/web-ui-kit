import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <Button
      type="button"
      variant="ghost"
      size={showLabel ? 'sm' : 'icon'}
      className={cn(!showLabel && 'size-8', className)}
      aria-label={done ? copiedLabel : label}
      onClick={async () => {
        if (await copyText(value, copyFailedLabel)) {
          setDone(true)
          if (timerRef.current !== null) clearTimeout(timerRef.current)
          timerRef.current = setTimeout(() => {
            timerRef.current = null
            setDone(false)
          }, 1400)
        }
      }}
    >
      {done ? <Check aria-hidden="true" className="text-success" /> : <Copy aria-hidden="true" />}
      {showLabel && (done ? copiedLabel : label)}
    </Button>
  )
}
