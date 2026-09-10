"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

const chartConfig = {
  registrations: {
    label: "Registrations",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({
  data,
}: {
  data: { date: string; registrations: number }[]
}) {
  const [timeRange, setTimeRange] = React.useState("90d")

  const referenceDate = React.useMemo(() => {
    if (data.length === 0) return new Date()
    const last = new Date(data[data.length - 1].date)
    last.setHours(0, 0, 0, 0)
    return last
  }, [data])

  const filteredData = React.useMemo(() => {
    let daysToSubtract = 90
    if (timeRange === "30d") daysToSubtract = 30
    else if (timeRange === "7d") daysToSubtract = 7
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - (daysToSubtract - 1))
    return data.filter((item) => new Date(item.date) >= startDate)
  }, [data, timeRange, referenceDate])

  return (
    <Card>
      <CardHeader className="grid grid-cols-[1fr_auto] grid-rows-[auto_auto] items-start gap-1.5 space-y-0">
        <CardTitle>Registrations</CardTitle>
        <CardDescription>
          <span className="hidden sm:block">New registrations per day</span>
          <span className="sm:hidden">Per day</span>
        </CardDescription>
        <CardAction className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden sm:flex [&_[data-slot=toggle-group-item]]:px-4"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="flex w-36 sm:hidden" aria-label="Select a value">
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="90d" className="rounded-md">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-md">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-md">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillRegistrations" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-registrations)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-registrations)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value as string | number | Date).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" }
                    )
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="registrations"
              type="natural"
              fill="url(#fillRegistrations)"
              stroke="var(--color-registrations)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}