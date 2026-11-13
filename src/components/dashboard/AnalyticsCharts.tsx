import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { ComplaintStats } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';

interface AnalyticsChartsProps {
  stats: ComplaintStats;
}

const STATUS_PIE_COLORS = ['#ef4444', '#f59e0b', '#10b981']; // Open (red), In Progress (amber), Resolved (green)
const CATEGORY_BAR_COLORS = '#3b82f6';

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ stats }) => {
  const statusPieData = [
    { name: 'Open', value: stats.open },
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Resolved', value: stats.resolved },
  ].filter((d) => d.value > 0);

  const categoryBarData = stats.categoryCounts.map((c) => ({
    category: c.name.length > 14 ? c.name.substring(0, 12) + '...' : c.name,
    count: c.count,
    fullName: c.name,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Distribution Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Category-Wise Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoryBarData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No complaint category data recorded yet.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: number) => [`${val} complaints`, 'Total']}
                    labelFormatter={(_label, payload) =>
                      payload[0]?.payload?.fullName || _label
                    }
                  />
                  <Bar dataKey="count" fill={CATEGORY_BAR_COLORS} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Breakdown Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-emerald-600" />
            Complaint Resolution Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statusPieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No status records logged yet.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_PIE_COLORS[index % STATUS_PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => <span className="text-xs text-slate-700 font-medium">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
