import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FeatureCard } from "./data"

function FeatureCardComponent({ feature }: { feature: FeatureCard }) {
  const Icon = feature.icon
  return (
    <Card>
      <CardHeader>
        <Icon className={`mb-2 h-10 w-10 ${feature.iconColor}`} />
        <CardTitle>{feature.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{feature.description}</p>
      </CardContent>
    </Card>
  )
}

export function FeaturesSection({ features }: { features: FeatureCard[] }) {
  return (
    <section className="border-y bg-muted/50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Tutto quello che ti serve per avere successo
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            La nostra piattaforma collaborativa fornisce tutti gli strumenti
            necessari per uno studio efficace e una preparazione ottimale agli
            esami.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCardComponent key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
