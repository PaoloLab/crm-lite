'use client';

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface PipelineTrendPoint {
  month: string;
  vinto: number;
  pipelineAperta: number;
}

const currencyFormatter = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const SERIES_LABEL: Record<'vinto' | 'pipelineAperta', string> = {
  vinto: 'Vinto',
  pipelineAperta: 'Pipeline aperta',
};

// Client Component "use client" obbligato: recharts usa hook/misure DOM
// interne, non renderizzabile da Server Component (stesso motivo per cui
// Table in components/ui/ è "use client" — vedi AGENTS.md).
export function PipelineTrendChart({ data }: { data: PipelineTrendPoint[] }) {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="pipelineAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--color-border-subtle)" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }}
            contentStyle={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              fontSize: 12,
              padding: '8px 10px',
            }}
            labelStyle={{ color: 'var(--color-text-muted)', marginBottom: 4 }}
            itemStyle={{ color: 'var(--color-text-primary)', padding: 0 }}
            formatter={(value, name) => [
              currencyFormatter.format(Number(value)),
              SERIES_LABEL[name as 'vinto' | 'pipelineAperta'] ?? String(name),
            ]}
          />
          <Area
            type="monotone"
            dataKey="pipelineAperta"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#pipelineAreaFill)"
          />
          <Line
            type="monotone"
            dataKey="vinto"
            stroke="var(--color-success)"
            strokeWidth={2}
            dot={{ r: 3, fill: 'var(--color-success)', strokeWidth: 0 }}
            activeDot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
