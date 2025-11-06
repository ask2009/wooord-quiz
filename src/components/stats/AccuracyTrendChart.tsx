
"use client"

import { useMemo } from "react"
import { Line, LineChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts"
import { format } from 'date-fns';
import { AnswerRecord } from "@/lib/types"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

type AccuracyTrendChartProps = {
  history: AnswerRecord[]
}

export default function AccuracyTrendChart({ history }: AccuracyTrendChartProps) {
  const data = useMemo(() => {
    const dailyStats = history.reduce((acc, record) => {
      const date = format(new Date(record.timestamp), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { correct: 0, total: 0, date };
      }
      acc[date].total++;
      if (record.correct) {
        acc[date].correct++;
      }
      return acc;
    }, {} as Record<string, { correct: number, total: number, date: string }>);

    return Object.values(dailyStats)
      .map(day => ({
        date: day.date,
        accuracy: Math.round((day.correct / day.total) * 100),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [history]);

  if (data.length < 2) {
    return (
        <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            時系列データを表示するには、2日以上の履歴が必要です。
        </div>
    );
  }

  const chartConfig = {
    accuracy: {
      label: "正解率",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ left: -20, right: 20 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => format(new Date(value), 'M/d')}
          />
          <Tooltip
            content={<ChartTooltipContent 
                formatter={(value) => `${value}%`}
            />}
          />
          <Line
            dataKey="accuracy"
            type="monotone"
            stroke="var(--color-accuracy)"
            strokeWidth={2}
            dot={{
              fill: "var(--color-accuracy)",
            }}
            activeDot={{
              r: 6,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
