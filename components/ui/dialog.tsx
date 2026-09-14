"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"

function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & { showCloseButton?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        className="fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs"
      />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-xl border bg-popover p-6 text-popover-foreground shadow-lg transition duration-200 data-ending-style:opacity-0 data-ending-style:scale-95 data-starting-style:opacity-0 data-starting-style:scale-95",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            render={<Button variant="ghost" size="icon-sm" className="absolute top-3 right-3" />}
          >
            <XIcon />
            <span className="sr-only">Cerrar</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5", className)} {...props} />
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return <DialogPrimitive.Title className={cn("text-lg font-semibold", className)} {...props} />
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return <DialogPrimitive.Description className={cn("text-sm text-muted-foreground", className)} {...props} />
}

export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle }
