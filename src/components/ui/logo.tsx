import { cn } from "@/lib/utils"

type LogoIconProps = {
  className?: string
  size?: number
}

export function LogoIcon({ className, size = 24 }: LogoIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Brain/question paths */}
      <path
        d="M17.306 11.252a5.294 5.294 0 1 0-10.588 0 5.237 5.237 0 0 0 .584 2.37A5.28 5.28 0 0 0 8.836 23.958"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.582 21.563a7 7 0 1 0 11.322 6.783V28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeMiterlimit="10"
      />
      <path
        d="M8.431 42.329A6.216 6.216 0 0 1 5.108 36.825a6.15 6.15 0 0 1 .686-2.783"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 16a5 5 0 0 1-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeMiterlimit="10"
      />

      {/* Connection lines */}
      <polyline
        points="19 16.01 30.5 16.01 32.521 13.99"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeMiterlimit="10"
      />
      <polyline
        points="25.5 20.01 31.5 20.01 33.521 17.99 39 17.99"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeMiterlimit="10"
      />
      <polyline
        points="24.917 31.99 30.5 31.99 32.521 34.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeMiterlimit="10"
      />
      <polyline
        points="24.917 27.99 31.5 27.99 33.521 30.01 39 30.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeMiterlimit="10"
      />
      <path
        d="M39 38.01H31.521l-1.521-2.02H25.042v6.052a5 5 0 0 1-10 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeMiterlimit="10"
      />
      <path
        d="M17.042 4.134a4.053 4.053 0 0 1 8 .918V12.01h4.459L31.521 9.99H39"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeMiterlimit="10"
      />
      <line
        x1="36"
        y1="24"
        x2="25.042"
        y2="24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeMiterlimit="10"
      />

      {/* Dots */}
      <circle cx="11" cy="20" r="1" fill="currentColor" />
      <circle cx="11.792" cy="43.5" r="1" fill="currentColor" />

      {/* Answer circles */}
      <circle cx="41.479" cy="10" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeMiterlimit="10" />
      <circle cx="41.479" cy="18" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeMiterlimit="10" />
      <circle cx="41.479" cy="30" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeMiterlimit="10" />
      <circle cx="41.479" cy="38" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeMiterlimit="10" />
    </svg>
  )
}
