import React from 'react';
import { Megaphone, Package, FileText, DollarSign, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Founder } from '../../types';

const FounderDashboard: React.FC = () => {
  const { user } = useAuth();
  const { campaigns, orders, transactions } = useApp();
  
  const founder = user as Founder;
  const founderCampaigns = campaigns.filter(c => c.founderId === founder.id);
  const founderOrders = orders.filter(o => o.founderId === founder.id);
  const founderTransactions = transactions.filter(t => t.userId === founder.id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const totalSpent = founderTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    { 
      name: 'Active Campaigns', 
      value: founderCampaigns.filter(c => c.status === 'active').length.toString(), 
      icon: Megaphone, 
      color: 'bg-blue-500' 
    },
    { 
      name: 'Total Orders', 
      value: founderOrders.length.toString(), 
      icon: Package, 
      color: 'bg-green-500' 
    },
    { 
      name: 'Completed Reviews', 
      value: founderOrders.filter(o => o.status === 'completed').length.toString(), 
      icon: FileText, 
      color: 'bg-purple-500' 
    },
    { 
      name: 'Wallet Balance', 
      value: formatCurrency(founder.walletBalance), 
      icon: DollarSign, 
      color: 'bg-yellow-500' 
    },
  ];

  const recentCampaigns = founderCampaigns.slice(0, 3).map(campaign => ({
    id: campaign.id,
    name: campaign.title,
    status: campaign.status,
    applicants: campaign.applicants.length,
    budget: formatCurrency(campaign.price)
  }));

  const recentOrders = founderOrders.slice(0, 3).map(order => ({
    id: order.id,
    talent: order.talentName,
    product: order.productName,
    status: order.status,
    date: order.createdAt.toLocaleDateString()
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Founder Dashboard</h1>
        <p className="text-gray-600">Manage your campaigns and track performance</p>
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
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Campaign Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>
          <TrendingUp className="h-5 w-5 text-green-500" />
        </div>
        <div className="h-64 bg-gradient-to-t from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">Total Campaign Investment</p>
            <p className="text-3xl font-bold text-gray-700">{formatCurrency(totalSpent)}</p>
            <p className="text-sm text-gray-400">{founderCampaigns.length} campaigns created</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Campaigns</h3>
          <div className="space-y-3">
            {recentCampaigns.length > 0 ? (
              recentCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{campaign.name}</p>
                    <p className="text-sm text-gray-600">{campaign.applicants} applicants • {campaign.budget}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Megaphone className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No campaigns yet</p>
                <p className="text-gray-400 text-xs">Create your first campaign to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{order.talent}</p>
                    <p className="text-sm text-gray-600">{order.product} • {order.date}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'review_submitted' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No orders yet</p>
                <p className="text-gray-400 text-xs">Orders will appear when talents are approved</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderDashboard;