import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp, Users, DollarSign, Megaphone, Star,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// Utility for grouping by month
function groupByMonth(items, dateField, valueField) {
  const result: Record<string, number> = {};
  items.forEach(item => {
    const date = new Date(item[dateField]);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    result[month] = (result[month] || 0) + (valueField ? Number(item[valueField]) : 1);
  });
  return result;
}

const AnalyticsPage: React.FC = () => {
  const { orders, transactions, campaigns, talents, founders } = useApp();

  // Analytics data
  const revenueByMonth = groupByMonth(
    transactions.filter(t => t.type === 'credit' && t.description?.toLowerCase().includes('admin fee')),
    'createdAt',
    'amount'
  );
  const talentPayoutByMonth = groupByMonth(
    transactions.filter(t => t.type === 'credit' && t.description?.toLowerCase().includes('payment received')),
    'createdAt',
    'amount'
  );
  const campaignsByMonth = groupByMonth(campaigns, 'createdAt');

  // Merge all months for chart
  const monthsSet = new Set([
    ...Object.keys(revenueByMonth),
    ...Object.keys(talentPayoutByMonth),
    ...Object.keys(campaignsByMonth),
  ]);
  const months = Array.from(monthsSet).sort();

  // Data for chart
  const chartData = months.map(month => ({
    month,
    Revenue: revenueByMonth[month] || 0,
    'Talent Payments': talentPayoutByMonth[month] || 0,
    Campaigns: campaignsByMonth[month] || 0,
  }));

  // Quick stats
  const totalRevenue = Object.values(revenueByMonth).reduce((a, b) => a + b, 0);
  const totalTalentPayout = Object.values(talentPayoutByMonth).reduce((a, b) => a + b, 0);
  const totalCampaigns = campaigns.length;
  const totalTalents = talents.length;
  const totalFounders = founders.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
        <p className="text-gray-600">See platform growth, revenue, and activity over time</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col items-center">
          <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
          <span className="text-lg font-semibold text-gray-700">{totalCampaigns}</span>
          <span className="text-xs text-gray-500">Total Campaigns</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col items-center">
          <DollarSign className="h-8 w-8 text-blue-600 mb-2" />
          <span className="text-lg font-semibold text-gray-700">
            {totalRevenue.toLocaleString('ms-MY', { style: 'currency', currency: 'MYR' })}
          </span>
          <span className="text-xs text-gray-500">Total Revenue</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col items-center">
          <Star className="h-8 w-8 text-purple-600 mb-2" />
          <span className="text-lg font-semibold text-gray-700">
            {totalTalentPayout.toLocaleString('ms-MY', { style: 'currency', currency: 'MYR' })}
          </span>
          <span className="text-xs text-gray-500">Talent Payouts</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col items-center">
          <Users className="h-8 w-8 text-blue-500 mb-2" />
          <span className="text-lg font-semibold text-gray-700">{totalTalents}</span>
          <span className="text-xs text-gray-500">Talents</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col items-center">
          <Megaphone className="h-8 w-8 text-yellow-500 mb-2" />
          <span className="text-lg font-semibold text-gray-700">{totalFounders}</span>
          <span className="text-xs text-gray-500">Founders</span>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue & Campaign Activity</h3>
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Revenue" fill="#22d3ee" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Talent Payments" fill="#818cf8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Campaigns" fill="#fde047" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Optional: Add line chart for more granularity */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue vs Talent Payouts</h3>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Revenue" stroke="#22d3ee" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="Talent Payments" stroke="#818cf8" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
