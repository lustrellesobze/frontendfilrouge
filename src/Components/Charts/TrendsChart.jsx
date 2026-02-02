import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TrendsChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                Aucune donnée disponible
            </div>
        );
    }

    const chartData = data.map(item => ({
        date: new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        count: item.count || 0,
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                    dataKey="date" 
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                />
                <YAxis 
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        padding: '8px'
                    }}
                />
                <Legend />
                <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#4F46E5" 
                    strokeWidth={3}
                    dot={{ fill: '#4F46E5', r: 5 }}
                    activeDot={{ r: 8 }}
                    name="Inscriptions"
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default TrendsChart;
