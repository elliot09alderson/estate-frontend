import React from 'react';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

// Modern color palette with transparency
const COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  muted: 'hsl(var(--muted))',
  // Chart specific colors with glassmorphism transparency
  chartColors: [
    'rgba(59, 130, 246, 0.5)', // Glass Blue
    'rgba(16, 185, 129, 0.5)', // Glass Green
    'rgba(245, 158, 11, 0.5)', // Glass Yellow
    'rgba(239, 68, 68, 0.5)',  // Glass Red
    'rgba(139, 92, 246, 0.5)', // Glass Purple
    'rgba(236, 72, 153, 0.5)', // Glass Pink
  ],
  // Stroke colors (darker for borders and lines)
  strokeColors: [
    'rgba(59, 130, 246, 0.7)', // Blue
    'rgba(16, 185, 129, 0.7)', // Green
    'rgba(245, 158, 11, 0.7)', // Yellow
    'rgba(239, 68, 68, 0.7)',  // Red
    'rgba(139, 92, 246, 0.7)', // Purple
    'rgba(236, 72, 153, 0.7)', // Pink
  ],
  // Gradient colors
  gradients: {
    blue: 'rgba(59, 130, 246, 0.1)',
    green: 'rgba(16, 185, 129, 0.1)',
    yellow: 'rgba(245, 158, 11, 0.1)',
    red: 'rgba(239, 68, 68, 0.1)',
    purple: 'rgba(139, 92, 246, 0.1)',
    pink: 'rgba(236, 72, 153, 0.1)',
  }
};

interface ChartData {
  byCategory?: Array<{ _id: string; count: number }>;
  byType?: Array<{ _id: string; count: number }>;
  monthlyData?: Array<{ month: string; users: number; properties: number }>;
}

interface AdminChartsProps {
  data?: ChartData;
}

const AdminCharts: React.FC<AdminChartsProps> = ({ data }) => {
  const categoryData = data?.byCategory?.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count,
  })) || [
    { name: 'Flat', value: 45 },
    { name: 'House', value: 30 },
    { name: 'Shop', value: 15 },
    { name: 'Land', value: 10 },
  ];

  const typeData = data?.byType?.map(item => ({
    name: item._id === 'sale' ? 'For Sale' : 'For Rent',
    count: item.count,
  })) || [
    { name: 'For Sale', count: 65 },
    { name: 'For Rent', count: 35 },
  ];

  const monthlyData = data?.monthlyData || [
    { month: 'Jan', users: 45, properties: 30 },
    { month: 'Feb', users: 52, properties: 38 },
    { month: 'Mar', users: 48, properties: 42 },
    { month: 'Apr', users: 61, properties: 50 },
    { month: 'May', users: 55, properties: 48 },
    { month: 'Jun', users: 67, properties: 55 },
  ];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3">
          {label && <p className="font-medium">{`${label}`}</p>}
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.payload?.name || entry.name || 'Unknown'}: {entry.value || entry.payload?.value || 0}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom pie tooltip component
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = categoryData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((data.value / total) * 100).toFixed(1);

      return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            Count: {data.value}
          </p>
          <p className="text-xs text-muted-foreground">
            {percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="card-elevated p-6 bg-background/60 backdrop-blur-md border border-border/20 shadow-xl">
        <h3 className="text-lg font-semibold mb-4 text-foreground/90">Monthly Growth</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(59, 130, 246, 0.8)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="rgba(59, 130, 246, 0.8)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProperties" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(16, 185, 129, 0.8)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="rgba(16, 185, 129, 0.8)" stopOpacity={0}/>
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="users"
              stroke="rgba(59, 130, 246, 1)"
              strokeWidth={3}
              name="New Users"
              dot={{ fill: "rgba(59, 130, 246, 1)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "rgba(59, 130, 246, 1)" }}
            />
            <Line
              type="monotone"
              dataKey="properties"
              stroke="rgba(16, 185, 129, 1)"
              strokeWidth={3}
              name="New Properties"
              dot={{ fill: "rgba(16, 185, 129, 1)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "rgba(16, 185, 129, 1)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="card-elevated p-6 bg-background/60 backdrop-blur-md border border-border/20 shadow-xl">
        <h3 className="text-lg font-semibold mb-4 text-foreground/90">Property Distribution by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <defs>
              <filter id="pieGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <linearGradient id="pieGradient0" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.7)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.3)" />
              </linearGradient>
              <linearGradient id="pieGradient1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.7)" />
                <stop offset="100%" stopColor="rgba(16, 185, 129, 0.3)" />
              </linearGradient>
              <linearGradient id="pieGradient2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(245, 158, 11, 0.7)" />
                <stop offset="100%" stopColor="rgba(245, 158, 11, 0.3)" />
              </linearGradient>
              <linearGradient id="pieGradient3" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(239, 68, 68, 0.7)" />
                <stop offset="100%" stopColor="rgba(239, 68, 68, 0.3)" />
              </linearGradient>
            </defs>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              label={false}
              outerRadius={90}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={3}
              filter="url(#pieGlow)"
            >
              {categoryData.map((entry, index) => {
                const glassStokeColors = [
                  'rgba(59, 130, 246, 0.8)', // Blue
                  'rgba(16, 185, 129, 0.8)', // Green
                  'rgba(245, 158, 11, 0.8)', // Yellow
                  'rgba(239, 68, 68, 0.8)',  // Red
                ];
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#pieGradient${index % 4})`}
                    stroke={glassStokeColors[index % glassStokeColors.length]}
                    strokeWidth={1}
                    strokeOpacity={0.6}
                  />
                );
              })}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value, entry) => {
                const data = categoryData.find(item => item.name === value);
                const percentage = data ? ((data.value / categoryData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0) : 0;
                return `${value}: ${percentage}%`;
              }}
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'hsl(var(--foreground))'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card className="card-elevated p-6 bg-background/60 backdrop-blur-md border border-border/20 shadow-xl">
        <h3 className="text-lg font-semibold mb-4 text-foreground/90">Sale vs Rent</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={typeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(59, 130, 246, 0.9)" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="rgba(59, 130, 246, 0.3)" stopOpacity={0.3}/>
              </linearGradient>
              <filter id="barGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="count"
              fill="url(#barGradient)"
              stroke="rgba(59, 130, 246, 0.2)"
              strokeWidth={2}
              name="Properties"
              radius={[12, 12, 0, 0]}
              filter="url(#barGlow)"
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="card-elevated p-6 bg-background/60 backdrop-blur-md border border-border/20 shadow-xl">
        <h3 className="text-lg font-semibold mb-4 text-foreground/90">Category Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="barGradient2" x1="0" y1="0" x2="1" y2="0">
                <stop offset="5%" stopColor="rgba(16, 185, 129, 0.9)" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="rgba(16, 185, 129, 0.3)" stopOpacity={0.3}/>
              </linearGradient>
              <filter id="barGlow2">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
            />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              fill="url(#barGradient2)"
              stroke="rgba(16, 185, 129, 0.2)"
              strokeWidth={2}
              name="Count"
              radius={[0, 12, 12, 0]}
              filter="url(#barGlow2)"
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default AdminCharts;