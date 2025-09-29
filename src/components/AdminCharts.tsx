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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="card-elevated p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Growth</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#8884d8"
              strokeWidth={2}
              name="New Users"
            />
            <Line
              type="monotone"
              dataKey="properties"
              stroke="#82ca9d"
              strokeWidth={2}
              name="New Properties"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="card-elevated p-6">
        <h3 className="text-lg font-semibold mb-4">Property Distribution by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card className="card-elevated p-6">
        <h3 className="text-lg font-semibold mb-4">Sale vs Rent</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={typeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" name="Properties" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="card-elevated p-6">
        <h3 className="text-lg font-semibold mb-4">Category Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Bar dataKey="value" fill="#82ca9d" name="Count" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default AdminCharts;