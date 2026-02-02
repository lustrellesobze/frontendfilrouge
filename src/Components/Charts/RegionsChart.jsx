import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RegionsChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                Aucune donnée disponible
            </div>
        );
    }

    const chartData = data.map(item => ({
        name: item.name,
        count: item.count || 0,
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                    type="number"
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                />
                <YAxis 
                    type="category" 
                    dataKey="name"
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                    width={90}
                />
                <Tooltip 
                    formatter={(value) => [`${value} candidats`, '']}
                    contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        padding: '8px'
                    }}
                />
                <Legend />
                <Bar 
                    dataKey="count" 
                    fill="#10B981" 
                    radius={[0, 8, 8, 0]}
                    name="Candidats par région"
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default RegionsChart;
