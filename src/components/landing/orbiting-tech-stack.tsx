import { useState, useSyncExternalStore } from "react"
import { motion } from "framer-motion"

import { LogoIcon } from "@/components/ui/logo"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import { scaleIn, withReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { techStackItems } from "./tech-icons"

const INNER_ITEMS = techStackItems.slice(0, 3)
const OUTER_ITEMS = techStackItems.slice(3, 6)

type OrbitSize = "sm" | "md" | "lg"

interface OrbitDimensions {
  container: number
  innerRadius: number
  outerRadius: number
  iconWrapper: number
  iconInner: number
  hubWrapper: number
  hubInner: number
}

const DIMENSIONS: Record<OrbitSize, OrbitDimensions> = {
  sm: {
    container: 280,
    innerRadius: 75,
    outerRadius: 120,
    iconWrapper: 36,
    iconInner: 18,
    hubWrapper: 56,
    hubInner: 26,
  },
  md: {
    container: 400,
    innerRadius: 100,
    outerRadius: 170,
    iconWrapper: 44,
    iconInner: 22,
    hubWrapper: 72,
    hubInner: 32,
  },
  lg: {
    container: 450,
    innerRadius: 100,
    outerRadius: 180,
    iconWrapper: 48,
    iconInner: 24,
    hubWrapper: 80,
    hubInner: 36,
  },
}

const SM_QUERY = "(min-width: 640px)"
const MD_QUERY = "(min-width: 768px)"

function subscribe(callback: () => void) {
  const sm = window.matchMedia(SM_QUERY)
  const md = window.matchMedia(MD_QUERY)
  sm.addEventListener("change", callback)
  md.addEventListener("change", callback)
  return () => {
    sm.removeEventListener("change", callback)
    md.removeEventListener("change", callback)
  }
}

function getSnapshot(): OrbitSize {
  if (window.matchMedia(MD_QUERY).matches) return "lg"
  if (window.matchMedia(SM_QUERY).matches) return "md"
  return "sm"
}

function getServerSnapshot(): OrbitSize {
  return "sm"
}

function useOrbitSize(): OrbitSize {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

function OrbitIcon({
  item,
  angle,
  radius,
  isPaused,
  orbitDuration,
  direction,
  wrapperSize,
  iconSize,
}: {
  item: (typeof techStackItems)[number]
  angle: number
  radius: number
  isPaused: boolean
  orbitDuration: number
  direction: "normal" | "reverse"
  wrapperSize: number
  iconSize: number
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
          "flex items-center justify-center rounded-full",
          "border bg-card/80 backdrop-blur-sm shadow-lg",
          "transition-all duration-300 hover:scale-110",
        )}
        style={{
          width: wrapperSize,
          height: wrapperSize,
          boxShadow: `0 0 0 1px hsl(var(--border)), 0 4px 12px rgba(0,0,0,0.1)`,
        }}
        title={item.name}
      >
        <item.Icon size={iconSize} />
      </div>
    </div>
  )
}

export function OrbitingTechStack({ className }: { className?: string }) {
  const [isPaused, setIsPaused] = useState(false)
  const prefersReduced = useReducedMotion()
  const { ref, isVisible } = useScrollReveal()
  const entrance = withReducedMotion(scaleIn, prefersReduced)
  const size = useOrbitSize()
  const dims = DIMENSIONS[size]

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
        className="relative"
        style={{ width: dims.container, height: dims.container }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Outer orbit ring */}
        <div
          className="absolute rounded-full border border-dashed border-border/50"
          style={{
            inset: `calc(50% - ${dims.outerRadius}px)`,
            width: dims.outerRadius * 2,
            height: dims.outerRadius * 2,
          }}
        />

        {/* Inner orbit ring */}
        <div
          className="absolute rounded-full border border-dashed border-border/50"
          style={{
            inset: `calc(50% - ${dims.innerRadius}px)`,
            width: dims.innerRadius * 2,
            height: dims.innerRadius * 2,
          }}
        />

        {/* Center hub */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className="relative flex items-center justify-center rounded-full border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-card shadow-lg"
            style={{ width: dims.hubWrapper, height: dims.hubWrapper }}
          >
            <div className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_30px_hsl(var(--primary)/0.2)]" />
            <LogoIcon size={dims.hubInner} />
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
              radius={dims.innerRadius}
              isPaused={isPaused}
              orbitDuration={innerDuration}
              direction="normal"
              wrapperSize={dims.iconWrapper}
              iconSize={dims.iconInner}
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
              radius={dims.outerRadius}
              isPaused={isPaused}
              orbitDuration={outerDuration}
              direction="reverse"
              wrapperSize={dims.iconWrapper}
              iconSize={dims.iconInner}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
