import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
    draft: '#9CA3AF',
    submitted: '#FBBF24',
    validated: '#10B981',
    rejected: '#EF4444',
};

const StatusChart = ({ data }) => {
    const chartData = Object.entries(data || {}).map(([name, value]) => ({
        name: name === 'draft' ? 'Brouillon' :
              name === 'submitted' ? 'Soumis' :
              name === 'validated' ? 'Validé' :
              name === 'rejected' ? 'Rejeté' : name,
        value: value || 0,
        color: COLORS[name] || '#9CA3AF',
    }));

    if (chartData.length === 0 || chartData.every(item => item.value === 0)) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                Aucune donnée disponible
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default StatusChart;
