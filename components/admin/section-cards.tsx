import { TrendingDown, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type SectionCard = {
  label: string
  value: string
  badge: string
  trend: "up" | "down"
  footerTitle: string
  footerSub: string
}

export function SectionCards({ cards }: { cards: SectionCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="bg-gradient-to-t from-primary/5 to-card dark:bg-card"
        >
          <CardHeader className="grid grid-cols-[1fr_auto] grid-rows-[auto_auto] items-start gap-1.5 space-y-0">
            <CardDescription>{card.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums sm:text-3xl">
              {card.value}
            </CardTitle>
            <CardAction className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
              <Badge variant="outline">
                {card.trend === "down" ? <TrendingDown /> : <TrendingUp />}
                {card.badge}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {card.footerTitle}{" "}
              {card.trend === "down" ? (
                <TrendingDown className="size-4" />
              ) : (
                <TrendingUp className="size-4" />
              )}
            </div>
            <div className="text-muted-foreground">{card.footerSub}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}