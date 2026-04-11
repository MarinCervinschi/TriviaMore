import { useEffect, useRef } from "react"
import { MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup, useMap } from "@/components/ui/map"
import { useTheme } from "@/hooks/useTheme"
import { CAMPUS_LOCATION_CONFIG } from "@/lib/browse/constants"
import type { DepartmentLocation } from "@/lib/browse/types"

function FitBounds({ locations }: { locations: DepartmentLocation[] }) {
  const { map } = useMap()
  const fitted = useRef(false)

  useEffect(() => {
    if (!map || fitted.current || locations.length === 0) return
    fitted.current = true

    if (locations.length === 1) {
      map.flyTo({
        center: [Number(locations[0].longitude), Number(locations[0].latitude)],
        zoom: 14,
      })
      return
    }

    const lngs = locations.map((l) => Number(l.longitude))
    const lats = locations.map((l) => Number(l.latitude))
    map.fitBounds(
      [
        [Math.min(...lngs) - 0.02, Math.min(...lats) - 0.02],
        [Math.max(...lngs) + 0.02, Math.max(...lats) + 0.02],
      ],
      { padding: 48, maxZoom: 14 },
    )
  }, [map, locations])

  return null
}

export function DepartmentMap({ locations }: { locations: DepartmentLocation[] }) {
  const { resolvedTheme } = useTheme()

  if (locations.length === 0) return null

  const center = locations.find((l) => l.is_primary) ?? locations[0]
  const mapTheme = resolvedTheme === "dark" ? "dark" : "light"

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="h-4 w-4 text-primary" />
          Sedi
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[240px] sm:h-[300px] lg:h-[360px] w-full">
          <Map
            center={[Number(center.longitude), Number(center.latitude)]}
            zoom={12}
            theme={mapTheme}
            className="h-full w-full rounded-b-xl"
          >
            <FitBounds locations={locations} />
            <MapControls position="top-right" showZoom showCompass={false} />
            {locations.map((location) => (
              <MapMarker
                key={location.id}
                longitude={Number(location.longitude)}
                latitude={Number(location.latitude)}
              >
                <MarkerContent className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-background transition-transform hover:scale-110">
                  <MapPin className="h-4 w-4" />
                </MarkerContent>
                <MarkerPopup>
                  <div className="min-w-[220px] space-y-2">
                    <p className="font-semibold text-sm leading-snug">{location.name}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{location.address}</p>
                    {location.campus_location && (
                      <Badge variant="secondary" className="text-xs">
                        {CAMPUS_LOCATION_CONFIG[location.campus_location]?.label ?? location.campus_location}
                      </Badge>
                    )}
                  </div>
                </MarkerPopup>
              </MapMarker>
            ))}
          </Map>
        </div>
      </CardContent>
    </Card>
  )
}
