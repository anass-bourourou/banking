
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SpendingChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

const SpendingChart: React.FC<SpendingChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const formattedData = data.map(item => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1)
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg bg-white p-3 shadow-lg">
          <p className="font-medium text-bank-dark">{data.name}</p>
          <p className="text-sm text-bank-primary">
            {data.value.toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} € ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="border-b border-bank-gray-light p-4 md:p-6">
        <h3 className="text-lg font-semibold text-bank-dark">Répartition des dépenses</h3>
      </div>
      
      <div className="p-4 md:p-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                formatter={(value, entry: any, index) => {
                  return (
                    <span className="text-sm text-bank-dark">
                      {value} ({formattedData[index].percentage}%)
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SpendingChart;
