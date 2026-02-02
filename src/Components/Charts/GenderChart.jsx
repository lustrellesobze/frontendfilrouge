import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const GenderChart = ({ data }) => {
    const chartData = [
        { name: 'Garçons', value: data?.male || 0, color: '#3B82F6' },
        { name: 'Filles', value: data?.female || 0, color: '#EC4899' },
    ];

    if (data?.other && data.other > 0) {
        chartData.push({ name: 'Autre', value: data.other, color: '#9CA3AF' });
    }

    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) {
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
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} candidats`, '']} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default GenderChart;
