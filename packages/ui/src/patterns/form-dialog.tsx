import type { FormEvent, ReactNode } from 'react'
import { cn } from '../lib/utils'
import { Button } from '../primitives/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../primitives/dialog'
import { LoadingButton } from './loading-button'
import { Notice } from './notice'

export interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  error?: string | null
  pending?: boolean
  submitLabel?: string
  cancelLabel?: string
  onSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<void>
  maxWidthClassName?: string
  children: ReactNode
}

/** Standardized modal form for focused creation and edit flows. */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  error,
  pending = false,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  onSubmit,
  maxWidthClassName = 'sm:max-w-[520px]',
  children,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent className={cn(maxWidthClassName)}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void onSubmit(e)
          }}
          className="grid gap-4"
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className={description ? undefined : 'sr-only'}>
              {description ?? (typeof title === 'string' ? title : 'Form dialog')}
            </DialogDescription>
          </DialogHeader>

          {error && <Notice tone="error">{error}</Notice>}

          <div className="grid gap-4">{children}</div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              {cancelLabel}
            </Button>
            <LoadingButton type="submit" pending={pending}>
              {submitLabel}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
