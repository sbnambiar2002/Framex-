
import React, { useMemo, useState } from 'react';
import { Expense } from '../types';
import { EmptyStateIcon } from './icons/EmptyStateIcon';

interface ChartSectionProps {
  expenses: Expense[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

// --- Pie Chart Component ---
interface PieChartProps {
  data: { label: string; value: number }[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return <p className="text-gray-500">No payment data to display.</p>;

  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const slices = data.map((item, index) => {
    const percent = item.value / total;
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    cumulativePercent += percent;
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
    const largeArcFlag = percent > 0.5 ? 1 : 0;

    const pathData = [
      `M ${startX} ${startY}`, // Move
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
      'L 0 0', // Line to center
    ].join(' ');

    return {
      pathData,
      color: COLORS[index % COLORS.length],
      label: item.label,
      value: item.value,
      percentage: (percent * 100).toFixed(1)
    };
  });

  return (
    <div className="flex flex-col md:flex-row items-center gap-8">
      <div className="relative w-48 h-48 sm:w-64 sm:h-64">
        <svg viewBox="-1 -1 2 2" className="transform -rotate-90">
          {slices.map((slice, index) => (
            <path
              key={index}
              d={slice.pathData}
              fill={slice.color}
              className="cursor-pointer transition-transform transform hover:scale-105"
              onMouseEnter={() => setHoveredSlice(slice.label)}
              onMouseLeave={() => setHoveredSlice(null)}
            />
          ))}
        </svg>
        {hoveredSlice && (() => {
          const slice = slices.find(s => s.label === hoveredSlice);
          if (!slice) return null;
          return (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white p-2 rounded-lg shadow-lg text-center">
                    <p className="font-bold text-gray-800">{slice.label}</p>
                    <p className="text-sm text-gray-600">
                        {slice.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({slice.percentage}%)
                    </p>
                </div>
            </div>
          )
        })()}
      </div>
      <ul className="space-y-2 flex-1 w-full">
        {data.map((item, index) => (
          <li key={index} className="flex items-center text-sm">
            <span
              className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            ></span>
            <span className="font-medium text-gray-700 truncate" title={item.label}>{item.label}:</span>
            <span className="ml-auto text-gray-600 pl-2">{item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};


// --- Bar Chart Component ---
interface BarChartProps {
    data: { label: string; value: number }[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
    const [hoveredBar, setHoveredBar] = useState<{ label: string; value: number; x: number; y: number } | null>(null);

    const chartHeight = 250;
    
    if (data.length === 0) return <p className="text-gray-500">No payment data to display.</p>;
    
    const maxValue = Math.max(...data.map(d => d.value), 0);

    return (
        <div className="w-full relative pt-4">
            <svg width="100%" height={chartHeight + 40} className="border-l border-b border-gray-300 pl-2">
                {/* Y-Axis Labels */}
                <text x="0" y="10" className="text-xs fill-gray-500" textAnchor="start" dominantBaseline="hanging">{maxValue.toLocaleString()}</text>
                <text x="0" y={chartHeight / 2} className="text-xs fill-gray-500" textAnchor="start" dominantBaseline="middle">{(maxValue/2).toLocaleString()}</text>
                {/* FIX: Changed dominantBaseline from "baseline" to "alphabetic" as "baseline" is not a valid value for this SVG attribute. */}
                <text x="0" y={chartHeight} className="text-xs fill-gray-500" textAnchor="start" dominantBaseline="alphabetic">0</text>
                
                {/* Bars and X-Axis Labels */}
                {data.map((item, index) => {
                    const barWidth = (100 / data.length) * 0.7; // 70% of available space
                    const barX = (100 / data.length) * index + (100 / data.length) * 0.15; // 15% gap on each side
                    const barHeight = maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;
                    const barY = chartHeight - barHeight;

                    return (
                        <g key={index}>
                            <rect
                                x={`${barX}%`}
                                y={barY}
                                width={`${barWidth}%`}
                                height={barHeight}
                                fill={COLORS[0]}
                                className="transition-opacity hover:opacity-80 cursor-pointer"
                                onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const svgRect = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
                                    setHoveredBar({ label: item.label, value: item.value, x: rect.left - svgRect.left + rect.width / 2, y: rect.top - svgRect.top });
                                }}
                                onMouseLeave={() => setHoveredBar(null)}
                            />
                            <text
                                x={`calc(${barX}% + ${barWidth / 2}%)`}
                                y={chartHeight + 20}
                                className="text-xs fill-gray-500"
                                textAnchor="middle"
                            >
                                {item.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
            {hoveredBar && (
                 <div
                    className="absolute bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none transform -translate-x-1/2 -translate-y-full z-10"
                    style={{ left: hoveredBar.x, top: hoveredBar.y - 5 }}
                >
                    <p className="font-bold">{hoveredBar.label}</p>
                    <p>{hoveredBar.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
            )}
        </div>
    );
};

// --- Main Chart Section ---
const ChartSection: React.FC<ChartSectionProps> = ({ expenses }) => {
  const paymentExpenses = useMemo(() => expenses.filter(e => e.transactionType === 'payment'), [expenses]);
  
  const expensesByCategory = useMemo(() => {
    const dataMap = new Map<string, number>();
    paymentExpenses.forEach(exp => {
      dataMap.set(exp.expensesCategory, (dataMap.get(exp.expensesCategory) || 0) + exp.amount);
    });
    return Array.from(dataMap.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [paymentExpenses]);

  const expensesByMonth = useMemo(() => {
    const dataMap = new Map<string, { total: number, date: Date }>();
    paymentExpenses.forEach(exp => {
      const date = new Date(exp.timestamp);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!dataMap.has(monthKey)) {
        dataMap.set(monthKey, { total: 0, date: date });
      }
      dataMap.get(monthKey)!.total += exp.amount;
    });

    return Array.from(dataMap.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(item => ({ 
          label: item.date.toLocaleString('default', { month: 'short', year: '2-digit' }), 
          value: item.total 
      }));

  }, [paymentExpenses]);

  if (expenses.length === 0) {
    return (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <EmptyStateIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Data for Analytics</h3>
            <p className="mt-1 text-sm text-gray-500">Add some expense entries to see the charts.</p>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Payments by Expenses Category</h3>
        <PieChart data={expensesByCategory} />
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Monthly Payments Trend</h3>
        <BarChart data={expensesByMonth} />
      </div>
    </div>
  );
};

export default ChartSection;