import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

import { AnimatedStack } from "./animated-block"

type SummaryPanelProps = {
  children: ReactNode
  footerTip?: string
  className?: string
}

export function SummaryPanel({ children, footerTip, className }: SummaryPanelProps) {
  return (
    <aside
      className={cn(
        "flex flex-col gap-5 bg-muted/30 p-5 text-foreground",
        "border-t border-border sm:border-l sm:border-t-0",
        className,
      )}
    >
      <h2 className="sr-only">Riepilogo della sessione</h2>
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Riepilogo
      </div>
      <AnimatedStack className="flex flex-1 flex-col gap-5">
        {children}
      </AnimatedStack>
      {footerTip && (
        <div className="mt-auto border-t border-border/60 pt-4 text-[10.5px] leading-relaxed text-muted-foreground">
          {footerTip}
        </div>
      )}
    </aside>
  )
}
