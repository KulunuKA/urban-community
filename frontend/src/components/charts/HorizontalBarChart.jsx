import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const tooltipStyles = {
  backgroundColor: "rgba(15, 23, 42, 0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  fontSize: 12,
};

/**
 * Horizontal bars — `data`: [{ name, value, fill }].
 */
export function HorizontalBarChart({ data = [], height = 300 }) {
  if (!data.length) {
    return (
      <p className="py-12 text-center text-sm text-slate-500">No data to show</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
      >
        <XAxis
          type="number"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
          tickLine={{ stroke: "rgba(255,255,255,0.08)" }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={118}
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(99,102,241,0.06)" }}
          contentStyle={tooltipStyles}
          labelStyle={{ color: "#e2e8f0" }}
          itemStyle={{ color: "#e2e8f0" }}
          formatter={(value) => [value, "Issues"]}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={26}>
          {data.map((entry, i) => (
            <Cell key={entry.name + String(i)} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
