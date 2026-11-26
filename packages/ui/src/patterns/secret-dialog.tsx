import { KeyRound } from 'lucide-react'
import { Button } from '../primitives/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../primitives/dialog'
import { CopyButton } from './copy-button'
import { Notice } from './notice'

export interface SecretReveal {
  title: string
  items: { label: string; value: string }[]
}

/** One-time secret display: values are shown once with copy controls and a save warning. */
export function SecretDialog({
  secret,
  onClose,
  warningLabel = 'This secret will only be shown once. Copy and store it now.',
  savedLabel = 'I have saved it',
  srDescription = 'One-time secret reveal',
  copyLabel,
  copyFailedLabel,
}: {
  secret: SecretReveal | null
  onClose: () => void
  warningLabel?: string
  savedLabel?: string
  srDescription?: string
  copyLabel?: string
  copyFailedLabel?: string
}) {
  return (
    <Dialog open={!!secret} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[520px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mb-1 grid size-10 place-items-center rounded-lg bg-brand-soft text-brand-ink">
            <KeyRound className="size-5" />
          </div>
          <DialogTitle>{secret?.title}</DialogTitle>
          <DialogDescription className="sr-only">{srDescription}</DialogDescription>
        </DialogHeader>
        <Notice tone="warning">{warningLabel}</Notice>
        <div className="space-y-3">
          {secret?.items.map((it) => (
            <div key={it.label}>
              <div className="mb-1.5 text-xs font-medium text-muted-foreground">{it.label}</div>
              <div className="flex items-center gap-2 rounded-md border border-dashed border-input bg-muted/50 py-1.5 pr-1.5 pl-3">
                <code className="min-w-0 flex-1 font-mono text-[13px] break-all">{it.value}</code>
                <CopyButton value={it.value} label={copyLabel} copyFailedLabel={copyFailedLabel} />
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>{savedLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
