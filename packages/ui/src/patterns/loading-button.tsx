import { Loader2 } from 'lucide-react'
import type { ComponentProps } from 'react'
import { Button } from '../primitives/button'

/** Button that shows an inline spinner and blocks re-submission while `pending`. */
export function LoadingButton({
  pending,
  disabled,
  children,
  ...props
}: ComponentProps<typeof Button> & { pending?: boolean }) {
  return (
    <Button disabled={disabled || pending} aria-busy={pending || undefined} {...props}>
      {pending && <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" />}
      {children}
    </Button>
  )
}
