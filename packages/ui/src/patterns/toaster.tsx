import { CheckCircle2, CircleAlert, Info } from 'lucide-react'
import { Toaster as Sonner } from 'sonner'

export { toast } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      theme="system"
      gap={8}
      icons={{
        success: <CheckCircle2 className="size-4 text-success" />,
        error: <CircleAlert className="size-4 text-destructive" />,
        info: <Info className="size-4 text-muted-foreground" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            '!rounded-lg !border !border-border !bg-popover !text-popover-foreground !shadow-popover !text-[13px] !font-medium !gap-2.5 !px-4 !py-3',
        },
      }}
    />
  )
}
