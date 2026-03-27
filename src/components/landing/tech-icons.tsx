import { cn } from "@/lib/utils"

interface TechIconProps {
  className?: string
  size?: number
}

export function ReactIcon({ className, size = 24 }: TechIconProps) {
  return (
    <svg
      viewBox="-11.5 -10.232 23 20.463"
      width={size}
      height={size}
      className={cn("text-[#61DAFB]", className)}
    >
      <circle r="2.05" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  )
}

export function TypeScriptIcon({ className, size = 24 }: TechIconProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      className={cn("text-[#3178C6]", className)}
    >
      <rect width="128" height="128" rx="12" fill="currentColor" />
      <path
        d="M82.4 97.4c2.6 4 6.3 6.9 12.9 6.9 5.4 0 8.9-2.7 8.9-6.4 0-4.5-3.6-6-9.5-8.6l-3.3-1.4c-9.4-4-15.7-9-15.7-19.6 0-9.8 7.4-17.2 19-17.2 8.3 0 14.2 2.9 18.5 10.4l-10.1 6.5c-2.2-4-4.6-5.6-8.4-5.6-3.8 0-6.2 2.4-6.2 5.6 0 3.9 2.4 5.5 8 7.9l3.3 1.4c11.1 4.8 17.4 9.6 17.4 20.5 0 11.7-9.2 18.2-21.5 18.2-12.1 0-19.9-5.7-23.7-13.2l10.4-6.4zM49.4 67.2H62V56H22v11.2h12.6v45.2H49.4V67.2z"
        fill="white"
      />
    </svg>
  )
}

export function TailwindIcon({ className, size = 24 }: TechIconProps) {
  return (
    <svg
      viewBox="0 0 54 33"
      width={size}
      height={size}
      className={cn("text-[#06B6D4]", className)}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z"
        fill="currentColor"
      />
    </svg>
  )
}

export function SupabaseIcon({ className, size = 24 }: TechIconProps) {
  return (
    <svg
      viewBox="0 0 109 113"
      width={size}
      height={size}
      className={className}
    >
      <path
        d="M63.708 110.284c-2.86 3.601-8.658 1.628-8.727-2.97l-1.007-67.251h45.22c8.19 0 12.758 9.46 7.665 15.874l-43.151 54.347z"
        fill="url(#supabase-a)"
      />
      <path
        d="M63.708 110.284c-2.86 3.601-8.658 1.628-8.727-2.97l-1.007-67.251h45.22c8.19 0 12.758 9.46 7.665 15.874l-43.151 54.347z"
        fill="url(#supabase-b)"
        fillOpacity=".2"
      />
      <path
        d="M45.317 2.071c2.86-3.601 8.657-1.628 8.726 2.97l.442 67.251H9.83c-8.19 0-12.759-9.46-7.665-15.875L45.317 2.071z"
        fill="#3ECF8E"
      />
      <defs>
        <linearGradient id="supabase-a" x1="53.974" y1="54.974" x2="94.163" y2="71.829" gradientUnits="userSpaceOnUse">
          <stop stopColor="#249361" />
          <stop offset="1" stopColor="#3ECF8E" />
        </linearGradient>
        <linearGradient id="supabase-b" x1="36.156" y1="30.578" x2="54.484" y2="65.081" gradientUnits="userSpaceOnUse">
          <stop />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function PostgreSQLIcon({ className, size = 24 }: TechIconProps) {
  return (
    <svg
      viewBox="0 0 25.6 25.6"
      width={size}
      height={size}
      className={cn("text-[#336791]", className)}
    >
      <path
        d="M18.983 18.636c.163-1.357.114-1.555 1.124-1.336l.257.023c.777.035 1.793-.125 2.4-.581 1.279-.96.723-2.562-.093-3.24.186-.125.197-.376.18-.79-.037-.918-.445-2.188-1.498-3.072-.662-.555-1.847-1.103-3.124-.828-.407-.493-.88-.905-1.453-1.254-.509-.311-1.027-.547-1.513-.697 1.08-1.612 1.716-3.511 1.69-4.725-.036-1.714-.68-3.014-1.85-3.754C14.056-.042 12.703-.15 11.468.172c-1.023.267-1.958.822-2.625 1.519-.662.69-1.105 1.47-1.286 2.292-.36 1.637.073 3.536.72 5.187-.348.264-.662.586-.906.974-.395.627-.626 1.394-.554 2.489l.002.048c.08 1.458.41 2.549 1.035 3.415-.022.152-.027.31-.001.478.072.467.407 1.118.773 1.64-.092.748-.21 1.437-.335 1.88-.184.654-.406 1.19-.696 1.599-.291.412-.656.717-1.18.964-1.053.496-1.906.464-2.8.228-.85-.224-1.741-.683-2.78-1.143-.483-.214-1.062-.124-1.32.296-.259.42-.099.918.384 1.132 1.064.472 2.04.978 3.07 1.25 1.034.274 2.233.319 3.613-.332.73-.344 1.276-.805 1.696-1.4.42-.592.7-1.244.902-1.96.17-.602.304-1.403.417-2.266.146.045.296.076.453.09-.026.283-.039.533-.033.737.018.59.085 1.081.236 1.614.153.534.407 1.133.855 1.614.543.583 1.298.759 2.048.715.75-.044 1.505-.292 2.076-.716.118-.088.265-.146.395-.226-.003.266-.006.477-.003.64.01.565.054 1.057.156 1.571.1.514.27 1.064.595 1.547.623.928 1.695 1.26 2.685 1.152.99-.107 1.902-.631 2.451-1.399z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth=".4"
        opacity=".8"
      />
    </svg>
  )
}

export function TanStackIcon({ className, size = 24 }: TechIconProps) {
  return (
    <svg
      viewBox="0 0 633 633"
      width={size}
      height={size}
      className={className}
    >
      <path
        fill="#002B41"
        d="M316.5 0C141.7 0 0 141.7 0 316.5S141.7 633 316.5 633 633 491.3 633 316.5 491.3 0 316.5 0z"
      />
      <path
        fill="#EF4444"
        d="M316.5 77c-132.3 0-239.5 107.2-239.5 239.5S184.2 556 316.5 556 556 448.8 556 316.5 448.8 77 316.5 77zm0 394.5c-85.6 0-155-69.4-155-155s69.4-155 155-155 155 69.4 155 155-69.4 155-155 155z"
      />
      <circle fill="#FF9D00" cx="316.5" cy="316.5" r="95" />
    </svg>
  )
}

export const techStackItems = [
  { name: "React", Icon: ReactIcon, color: "#61DAFB" },
  { name: "TypeScript", Icon: TypeScriptIcon, color: "#3178C6" },
  { name: "Tailwind CSS", Icon: TailwindIcon, color: "#06B6D4" },
  { name: "Supabase", Icon: SupabaseIcon, color: "#3ECF8E" },
  { name: "PostgreSQL", Icon: PostgreSQLIcon, color: "#336791" },
  { name: "TanStack", Icon: TanStackIcon, color: "#EF4444" },
] as const
