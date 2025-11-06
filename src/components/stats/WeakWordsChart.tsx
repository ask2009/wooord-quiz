
"use client"

import { useMemo } from "react"
import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { AnswerRecord } from "@/lib/types"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

type WeakWordsChartProps = {
  history: AnswerRecord[]
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--destructive))"];

export default function WeakWordsChart({ history }: WeakWordsChartProps) {
  const data = useMemo(() => {
    const correct = history.filter(h => h.correct).length
    const incorrect = history.length - correct
    return [
      { name: "Correct", value: correct },
      { name: "Incorrect", value: incorrect },
    ]
  }, [history])

  const total = useMemo(() => history.length, [history]);

  if (total === 0) {
    return (
        <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            データがありません
        </div>
    );
  }

  const chartConfig = {
    correct: {
      label: "Correct",
      color: "hsl(var(--chart-1))",
    },
    incorrect: {
      label: "Incorrect",
      color: "hsl(var(--destructive))",
    },
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[250px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={60}
            dataKey="value"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
           <Legend
            verticalAlign="middle"
            align="center"
            content={() => {
              return (
                <div className="flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold">
                        {Math.round((data[0].value / total) * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">正解率</div>
                </div>
              )
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
