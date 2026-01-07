/**
 * Trend Chart Component
 * 
 * Line chart for displaying Google Trends data using Recharts
 */

"use client";

import { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";

interface TrendChartProps {
    keyword: string;
    data?: Array<{ date: string; value: number }>;
}

// Generate mock trend data for demo purposes
function generateMockTrendData() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();

    return months.map((month, index) => {
        // Create a realistic trend pattern
        const baseValue = 40 + Math.random() * 20;
        const trend = index <= currentMonth ? (index / 12) * 30 : 0;
        const noise = (Math.random() - 0.5) * 15;

        return {
            date: month,
            value: Math.max(0, Math.min(100, Math.round(baseValue + trend + noise))),
        };
    }).slice(0, currentMonth + 1);
}

export function TrendChart({ keyword, data }: TrendChartProps) {
    const chartData = useMemo(() => {
        return data || generateMockTrendData();
    }, [data]);

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#18181b",
                            border: "1px solid #27272a",
                            borderRadius: "8px",
                            fontSize: "12px",
                        }}
                        labelStyle={{ color: "#a1a1aa" }}
                        itemStyle={{ color: "#10b981" }}
                        formatter={(value) => [`${value ?? 0}`, "Interest"]}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#trendGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

// Multi-year chart for Time Machine
interface TimeMachineChartProps {
    data: Array<{ year: number; month: string; value: number }>;
}

export function TimeMachineChart({ data }: TimeMachineChartProps) {
    return (
        <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis
                        dataKey="month"
                        stroke="#71717a"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#71717a"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#18181b",
                            border: "1px solid #27272a",
                            borderRadius: "8px",
                            fontSize: "12px",
                        }}
                        labelStyle={{ color: "#a1a1aa" }}
                        itemStyle={{ color: "#10b981" }}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: "#10b981" }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
