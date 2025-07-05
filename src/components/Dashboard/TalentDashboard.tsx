import React from 'react';
import { Briefcase, DollarSign, Star, TrendingUp, Calendar, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Talent } from '../../types';

const TalentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { orders, earnings, campaigns } = useApp();
  
  const talent = user as Talent;
  const talentOrders = orders.filter(o => o.talentId === talent.id);
  const talentEarnings = earnings.filter(e => e.talentId === talent.id);
  const appliedCampaigns = campaigns.filter(c => c.applicants.includes(talent.id));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const totalEarnings = talentEarnings
    .filter(e => e.status === 'paid')
    .reduce((sum, e) => sum + e.amount, 0);

  const pendingEarnings = talentEarnings
    .filter(e => e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);

  const completedJobs = talentEarnings.filter(e => e.status === 'paid').length;
  const successRate = talentOrders.length > 0 ? 
    Math.round((talentOrders.filter(o => o.status === 'completed').length / talentOrders.length) * 100) : 0;

  const stats = [
    { 
      name: 'Active Jobs', 
      value: talentOrders.filter(o => !['completed'].includes(o.status)).length.toString(), 
      icon: Briefcase, 
      color: 'bg-blue-500' 
    },
    { 
      name: 'Total Earnings', 
      value: formatCurrency(totalEarnings), 
      icon: DollarSign, 
      color: 'bg-green-500' 
    },
    { 
      name: 'Reviews Completed', 
      value: completedJobs.toString(), 
      icon: Star, 
      color: 'bg-purple-500' 
    },
    { 
      name: 'Success Rate', 
      value: `${successRate}%`, 
      icon: Award, 
      color: 'bg-yellow-500' 
    },
  ];

  const activeJobs = talentOrders
    .filter(o => !['completed'].includes(o.status))
    .slice(0, 3)
    .map(order => ({
      id: order.id,
      campaign: order.campaignTitle,
      brand: 'Brand', // You might want to get this from founder data
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // Mock deadline
      status: order.status,
      payout: formatCurrency(order.payout)
    }));

  const recentEarnings = talentEarnings
    .filter(e => e.status === 'paid')
    .slice(0, 3)
    .map(earning => ({
      id: earning.id,
      campaign: earning.campaignTitle,
      amount: formatCurrency(earning.amount),
      date: earning.paidAt?.toLocaleDateString() || earning.earnedAt.toLocaleDateString(),
      status: earning.status
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Talent Dashboard</h1>
        <p className="text-gray-600">Track your jobs and earnings</p>
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

      {/* Performance Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Earnings Overview</h3>
          <TrendingUp className="h-5 w-5 text-green-500" />
        </div>
        <div className="h-64 bg-gradient-to-t from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">Total Earnings</p>
            <p className="text-3xl font-bold text-gray-700">{formatCurrency(totalEarnings)}</p>
            <p className="text-sm text-gray-400">
              {formatCurrency(pendingEarnings)} pending • {completedJobs} jobs completed
            </p>
          </div>
        </div>
      </div>

      {/* Active Jobs and Recent Earnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Jobs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Jobs</h3>
          <div className="space-y-3">
            {activeJobs.length > 0 ? (
              activeJobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{job.campaign}</h4>
                    <span className="text-sm font-medium text-green-600">{job.payout}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{job.brand}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      Due: {job.deadline}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      job.status === 'completed' ? 'bg-green-100 text-green-800' :
                      job.status === 'review_submitted' ? 'bg-blue-100 text-blue-800' :
                      job.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No active jobs</p>
                <p className="text-gray-400 text-xs">Apply to campaigns to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Earnings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Earnings</h3>
          <div className="space-y-3">
            {recentEarnings.length > 0 ? (
              recentEarnings.map((earning) => (
                <div key={earning.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{earning.campaign}</p>
                    <p className="text-sm text-gray-600">{earning.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">{earning.amount}</p>
                    <p className="text-xs text-gray-500 capitalize">{earning.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <DollarSign className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No earnings yet</p>
                <p className="text-gray-400 text-xs">Complete jobs to start earning</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentDashboard;