import { useState } from "react"
import { motion } from "framer-motion"

import { LogoIcon } from "@/components/ui/logo"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import { scaleIn, withReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { techStackItems } from "./tech-icons"

const INNER_RADIUS = 100
const OUTER_RADIUS = 180
const INNER_ITEMS = techStackItems.slice(0, 3)
const OUTER_ITEMS = techStackItems.slice(3, 6)

function OrbitIcon({
  item,
  angle,
  radius,
  isPaused,
  orbitDuration,
  direction,
}: {
  item: (typeof techStackItems)[number]
  angle: number
  radius: number
  isPaused: boolean
  orbitDuration: number
  direction: "normal" | "reverse"
}) {
  const x = Math.cos((angle * Math.PI) / 180) * radius
  const y = Math.sin((angle * Math.PI) / 180) * radius
  const counterDirection = direction === "normal" ? "reverse" : "normal"

  return (
    <div
      className="absolute"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: "translate(-50%, -50%)",
        animation: `counter-orbit ${orbitDuration}s linear infinite ${counterDirection}`,
        animationPlayState: isPaused ? "paused" : "running",
      }}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full",
          "border bg-card/80 backdrop-blur-sm shadow-lg",
          "transition-all duration-300 hover:scale-110",
        )}
        style={{
          boxShadow: `0 0 0 1px hsl(var(--border)), 0 4px 12px rgba(0,0,0,0.1)`,
        }}
        title={item.name}
      >
        <item.Icon size={24} />
      </div>
    </div>
  )
}

export function OrbitingTechStack({ className }: { className?: string }) {
  const [isPaused, setIsPaused] = useState(false)
  const prefersReduced = useReducedMotion()
  const { ref, isVisible } = useScrollReveal()
  const entrance = withReducedMotion(scaleIn, prefersReduced)

  const innerDuration = 25
  const outerDuration = 35

  return (
    <motion.div
      ref={ref}
      className={cn("flex items-center justify-center", className)}
      variants={entrance}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      <div
        className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] md:w-[450px] md:h-[450px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Outer orbit ring */}
        <div
          className="absolute rounded-full border border-dashed border-border/50"
          style={{
            inset: `calc(50% - ${OUTER_RADIUS}px)`,
            width: OUTER_RADIUS * 2,
            height: OUTER_RADIUS * 2,
          }}
        />

        {/* Inner orbit ring */}
        <div
          className="absolute rounded-full border border-dashed border-border/50"
          style={{
            inset: `calc(50% - ${INNER_RADIUS}px)`,
            width: INNER_RADIUS * 2,
            height: INNER_RADIUS * 2,
          }}
        />

        {/* Center hub */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-card shadow-lg">
            <div className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_30px_hsl(var(--primary)/0.2)]" />
            <LogoIcon size={36} />
          </div>
        </div>

        {/* Inner orbit (clockwise) */}
        <div
          className="absolute inset-0"
          style={{
            animation: prefersReduced
              ? "none"
              : `orbit ${innerDuration}s linear infinite`,
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {INNER_ITEMS.map((item, i) => (
            <OrbitIcon
              key={item.name}
              item={item}
              angle={(360 / INNER_ITEMS.length) * i - 90}
              radius={INNER_RADIUS}
              isPaused={isPaused}
              orbitDuration={innerDuration}
              direction="normal"
            />
          ))}
        </div>

        {/* Outer orbit (counter-clockwise) */}
        <div
          className="absolute inset-0"
          style={{
            animation: prefersReduced
              ? "none"
              : `orbit ${outerDuration}s linear infinite reverse`,
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {OUTER_ITEMS.map((item, i) => (
            <OrbitIcon
              key={item.name}
              item={item}
              angle={(360 / OUTER_ITEMS.length) * i - 90}
              radius={OUTER_RADIUS}
              isPaused={isPaused}
              orbitDuration={outerDuration}
              direction="reverse"
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
