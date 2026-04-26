import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const tooltipStyles = {
  backgroundColor: "rgba(15, 23, 42, 0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  fontSize: 12,
};

/**
 * Donut chart for labeled segments — pass `data`: [{ name, value, fill }].
 */
export function SimpleDonutChart({
  data = [],
  height = 280,
  innerRadius = 68,
  outerRadius = 100,
}) {
  if (!data.length) {
    return (
      <p className="py-12 text-center text-sm text-slate-500">No data to show</p>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
          >
            {data.map((entry, i) => (
              <Cell
                key={entry.name + String(i)}
                fill={entry.fill}
                stroke="rgba(15,23,42,0.95)"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [value, name]}
            contentStyle={tooltipStyles}
            labelStyle={{ color: "#e2e8f0" }}
            itemStyle={{ color: "#e2e8f0" }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => (
              <span className="text-slate-400">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
