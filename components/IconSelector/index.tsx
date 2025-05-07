"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import iconMap from "@/lib/iconMap"

interface IconSelectorProps {
  selectedIcon: string
  onSelectIcon: (iconKey: string) => void
  className?: string
}

export default function IconSelector({ selectedIcon, onSelectIcon, className }: IconSelectorProps) {
  const [open, setOpen] = useState(false)
  const iconKeys = Object.keys(iconMap)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center gap-2">
            {iconMap[selectedIcon] || iconMap["default"]}
            <span>{selectedIcon}</span>
          </div>
          <span className="sr-only">Toggle icon selection</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]" align="start">
        <Command>
          <CommandInput placeholder="Search icons..." />
          <CommandEmpty>No icon found.</CommandEmpty>
          <CommandList>
            <ScrollArea className="h-[300px]">
              <CommandGroup>
                <div className="grid grid-cols-4 gap-1 p-2">
                  {iconKeys.map((iconKey) => (
                    <CommandItem
                      key={iconKey}
                      value={iconKey}
                      onSelect={() => {
                        onSelectIcon(iconKey)
                        setOpen(false)
                      }}
                      className="flex flex-col items-center justify-center gap-1 p-2 cursor-pointer rounded-md hover:bg-accent"
                    >
                      <div className="relative text-2xl">
                        {iconMap[iconKey]}
                        {selectedIcon === iconKey && (
                          <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs truncate max-w-full">{iconKey}</span>
                    </CommandItem>
                  ))}
                </div>
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
