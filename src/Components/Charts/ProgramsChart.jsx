import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ProgramsChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                Aucune donnée disponible
            </div>
        );
    }

    const chartData = data.map((item, index) => ({
        name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
        fullName: item.name,
        count: item.count || 0,
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    stroke="#6B7280"
                    style={{ fontSize: '11px' }}
                />
                <YAxis 
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                />
                <Tooltip 
                    formatter={(value, name, props) => [
                        `${value} candidats`,
                        props.payload.fullName || name
                    ]}
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
                    fill="#6366F1" 
                    radius={[8, 8, 0, 0]}
                    name="Nombre de candidats"
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default ProgramsChart;
