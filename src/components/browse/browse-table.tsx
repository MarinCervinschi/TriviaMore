import type { ReactNode } from "react"

export function BrowseTable({
  headers,
  children,
}: {
  headers: string[]
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-2xl border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {headers.map((header, i) => (
                <th
                  key={header}
                  className={`px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground first:pl-6 last:pr-6 ${i === 0 ? "text-left" : "text-center"}`}
                >
                  {header}
                </th>
              ))}
              {/* Arrow column */}
              <th className="w-10 pr-6" />
            </tr>
          </thead>
          <tbody className="divide-y">{children}</tbody>
        </table>
      </div>
    </div>
  )
}
