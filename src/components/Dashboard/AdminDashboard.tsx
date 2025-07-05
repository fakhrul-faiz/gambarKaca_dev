import React from 'react';
import { Users, Star, Megaphone, DollarSign, TrendingUp, AlertCircle, CheckCircle, Calendar, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const AdminDashboard: React.FC = () => {
  const { founders, talents, campaigns, orders, transactions, earnings } = useApp();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  // Calculate statistics
  const totalRevenue = transactions
    .filter(t => t.type === 'credit' && t.description.includes('Admin Fee'))
    .reduce((sum, t) => sum + t.amount, 0);

  const thisMonthRevenue = transactions
    .filter(t => {
      const transactionDate = new Date(t.createdAt);
      const now = new Date();
      return t.type === 'credit' && 
             t.description.includes('Admin Fee') &&
             transactionDate.getMonth() === now.getMonth() && 
             transactionDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    { 
      name: 'Total Founders', 
      value: founders.length.toString(), 
      icon: Users, 
      color: 'bg-blue-500',
      change: `+${founders.filter(f => {
        const createdDate = new Date(f.createdAt);
        const now = new Date();
        return createdDate.getMonth() === now.getMonth() && 
               createdDate.getFullYear() === now.getFullYear();
      }).length} this month`
    },
    { 
      name: 'Active Talents', 
      value: talents.filter(t => t.status === 'active').length.toString(), 
      icon: Star, 
      color: 'bg-purple-500',
      change: `${talents.filter(t => t.status === 'pending').length} pending approval`
    },
    { 
      name: 'Active Campaigns', 
      value: campaigns.filter(c => c.status === 'active').length.toString(), 
      icon: Megaphone, 
      color: 'bg-green-500',
      change: `${campaigns.filter(c => c.status === 'draft').length} drafts`
    },
    { 
      name: 'Monthly Revenue', 
      value: formatCurrency(thisMonthRevenue), 
      icon: DollarSign, 
      color: 'bg-yellow-500',
      change: `Total: ${formatCurrency(totalRevenue)}`
    },
  ];

  const recentActivity = [
    ...talents.filter(t => t.status === 'pending').slice(0, 2).map(talent => ({
      id: `talent-${talent.id}`,
      type: 'talent_approval',
      message: `New talent application from ${talent.name}`,
      time: `${Math.ceil((new Date().getTime() - talent.createdAt.getTime()) / (1000 * 60 * 60))} hours ago`,
      icon: Star,
      color: 'text-purple-600'
    })),
    ...campaigns.filter(c => c.status === 'active').slice(0, 2).map(campaign => ({
      id: `campaign-${campaign.id}`,
      type: 'campaign_created',
      message: `New campaign "${campaign.title}" created`,
      time: `${Math.ceil((new Date().getTime() - campaign.createdAt.getTime()) / (1000 * 60 * 60 * 24))} days ago`,
      icon: Megaphone,
      color: 'text-green-600'
    })),
    ...orders.filter(o => o.status === 'completed').slice(0, 2).map(order => ({
      id: `order-${order.id}`,
      type: 'payout_completed',
      message: `Payout of ${formatCurrency(order.payout)} completed for ${order.campaignTitle}`,
      time: `${Math.ceil((new Date().getTime() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24))} days ago`,
      icon: DollarSign,
      color: 'text-yellow-600'
    })),
  ].slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor and manage the GambarKaca platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="h-64 bg-gradient-to-t from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">Total Platform Revenue</p>
              <p className="text-3xl font-bold text-gray-700">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-gray-400">10% commission from completed jobs</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Icon className={`h-5 w-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-yellow-800">Talent Applications</h4>
                <p className="text-2xl font-bold text-yellow-900">
                  {talents.filter(t => t.status === 'pending').length}
                </p>
                <p className="text-sm text-yellow-700">Awaiting review</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-800">Campaign Reviews</h4>
                <p className="text-2xl font-bold text-blue-900">
                  {orders.filter(o => o.status === 'review_submitted').length}
                </p>
                <p className="text-sm text-blue-700">Pending approval</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-green-800">Active Orders</h4>
                <p className="text-2xl font-bold text-green-900">
                  {orders.filter(o => ['pending_shipment', 'shipped', 'delivered'].includes(o.status)).length}
                </p>
                <p className="text-sm text-green-700">In progress</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
            <p className="text-sm text-gray-600">Total Campaigns</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            <p className="text-sm text-gray-600">Total Orders</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(earnings.reduce((sum, e) => sum + e.amount, 0))}
            </p>
            <p className="text-sm text-gray-600">Total Payouts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {Math.round((orders.filter(o => o.status === 'completed').length / Math.max(orders.length, 1)) * 100)}%
            </p>
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;