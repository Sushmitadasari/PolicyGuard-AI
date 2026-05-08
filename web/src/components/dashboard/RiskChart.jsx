import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { name: "Jan", risk: 40 },
  { name: "Feb", risk: 70 },
  { name: "Mar", risk: 55 },
  { name: "Apr", risk: 90 },
];

function RiskChart() {

  return (
    <div className="glass p-6 rounded-3xl h-[400px]">

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="risk" stroke="#6C63FF" />
        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}

export default RiskChart;