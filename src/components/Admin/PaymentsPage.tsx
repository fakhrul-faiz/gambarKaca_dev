import React, { useState } from 'react';
import {
  DollarSign, Search, Filter, Calendar, TrendingUp, Users, Megaphone,
  CreditCard, Download, ArrowUpRight, Package, Star
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Payment {
  id: string;
  type: 'talent_payment' | 'admin_fee' | 'wallet_topup' | 'campaign_payout';
  orderId: string | null;
  campaignTitle: string;
  talentName?: string;
  founderName?: string;
  amount: number;
  adminFee?: number;
  totalAmount: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
}

const PaymentsPage: React.FC = () => {
  const { orders, transactions, founders, talents } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Generate payment records from all transactions (not just completed orders)
  const generatePayments = (): Payment[] => {
    const payments: Payment[] = [];
    transactions.forEach(tx => {
      // Find related order/campaign/talent/founder if possible
      const order = orders.find(o => o.id === tx.relatedJobId);
      const campaignTitle = order?.campaignTitle || tx.description || '—';
      const talent = talents.find(t => t.id === order?.talentId);
      const founder = founders.find(f => f.id === order?.founderId);

      // Determine type
      let type: Payment['type'] = 'talent_payment';
      if (tx.type === 'credit' && tx.description?.toLowerCase().includes('admin fee')) {
        type = 'admin_fee';
      } else if (tx.type === 'credit' && tx.description?.toLowerCase().includes('wallet top up')) {
        type = 'wallet_topup';
      } else if (tx.type === 'debit') {
        type = 'campaign_payout';
      }

      // Assign status (expand if you support other states)
      const status: Payment['status'] = 'completed';

      // For campaign_payout, show founder as payer
      const talentName = type === 'talent_payment' ? (talent?.name || order?.talentName || '-') : undefined;
      const founderName = founder?.name || (type === 'campaign_payout' ? founder?.name : undefined);

      payments.push({
        id: tx.id,
        type,
        orderId: tx.relatedJobId || null,
        campaignTitle,
        talentName,
        founderName,
        amount: Number(tx.amount) || 0,
        adminFee: type === 'admin_fee' ? Number(tx.amount) || 0 : undefined,
        totalAmount: Number(tx.amount) || 0,
        status,
        createdAt: tx.createdAt ? new Date(tx.createdAt) : new Date(),
      });
    });

    // Sort by most recent
    return payments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  const payments = generatePayments();

  // Apply filters
  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.campaignTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.talentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.founderName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || payment.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'talent_payment': return 'bg-blue-100 text-blue-800';
      case 'admin_fee':      return 'bg-green-100 text-green-800';
      case 'wallet_topup':   return 'bg-purple-100 text-purple-800';
      case 'campaign_payout':return 'bg-yellow-100 text-yellow-800';
      default:               return 'bg-gray-100 text-gray-800';
    }
  };
  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'talent_payment':  return <Users className="h-4 w-4" />;
      case 'admin_fee':       return <Star className="h-4 w-4" />;
      case 'wallet_topup':    return <CreditCard className="h-4 w-4" />;
      case 'campaign_payout': return <ArrowUpRight className="h-4 w-4" />;
      default:                return <DollarSign className="h-4 w-4" />;
    }
  };
  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'talent_payment':  return 'Talent Payment';
      case 'admin_fee':       return 'Admin Fee';
      case 'wallet_topup':    return 'Wallet Top Up';
      case 'campaign_payout': return 'Campaign Payout';
      default:                return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const totalRevenue = payments.filter(p => p.type === 'admin_fee').reduce((sum, p) => sum + p.amount, 0);
  const totalTalentPayments = payments.filter(p => p.type === 'talent_payment').reduce((sum, p) => sum + p.amount, 0);
  const totalWalletTopup = payments.filter(p => p.type === 'wallet_topup').reduce((sum, p) => sum + p.amount, 0);
  const totalPayouts = payments.filter(p => p.type === 'campaign_payout').reduce((sum, p) => sum + p.amount, 0);

  const totalTransactions = payments.length;
  const thisMonthRevenue = payments.filter(p => {
    const paymentDate = new Date(p.createdAt);
    const now = new Date();
    return p.type === 'admin_fee' &&
      paymentDate.getMonth() === now.getMonth() &&
      paymentDate.getFullYear() === now.getFullYear();
  }).reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Revenue</h1>
          <p className="text-gray-600">Monitor platform revenue and payment transactions</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors">
          <Download className="h-5 w-5" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Revenue Overview */}
      <div className="bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-green-100">Total Platform Revenue</h2>
            <p className="text-4xl font-bold">{formatCurrency(totalRevenue)}</p>
            <p className="text-green-100 text-sm mt-1">10% commission from all completed jobs</p>
          </div>
          <div className="p-4 bg-white bg-opacity-20 rounded-full">
            <DollarSign className="h-8 w-8" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-6 w-6 text-green-300" />
              <div>
                <p className="text-sm text-green-100">This Month</p>
                <p className="text-xl font-bold">{formatCurrency(thisMonthRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-blue-300" />
              <div>
                <p className="text-sm text-blue-100">Talent Payments</p>
                <p className="text-xl font-bold">{formatCurrency(totalTalentPayments)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-6 w-6 text-purple-300" />
              <div>
                <p className="text-sm text-purple-100">Total Transactions</p>
                <p className="text-xl font-bold">{totalTransactions}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admin Fees</p>
              <p className="text-2xl font-bold text-gray-900">
                {payments.filter(p => p.type === 'admin_fee').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Talent Payments</p>
              <p className="text-2xl font-bold text-gray-900">
                {payments.filter(p => p.type === 'talent_payment').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500">
              <Megaphone className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Jobs</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Commission</p>
              <p className="text-2xl font-bold text-gray-900">10%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by campaign, talent, or founder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="talent_payment">Talent Payments</option>
            <option value="admin_fee">Admin Fees</option>
            <option value="wallet_topup">Wallet Top Up</option>
            <option value="campaign_payout">Campaign Payouts</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Payment Transactions</h3>
          <p className="text-gray-600 text-sm">All platform payment activities and revenue records</p>
        </div>

        {filteredPayments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full border ${
                      payment.type === 'admin_fee'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      {getPaymentTypeIcon(payment.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-medium text-gray-900">{payment.campaignTitle}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentTypeColor(payment.type)}`}>
                          {getPaymentTypeIcon(payment.type)}
                          <span className="ml-1">{getPaymentTypeLabel(payment.type)}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {payment.createdAt.toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-1" />
                          Order #{payment.orderId}
                        </div>
                        {payment.talentName && (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {payment.talentName}
                          </div>
                        )}
                        {payment.type === 'talent_payment' && payment.adminFee && (
                          <div className="flex items-center text-green-600">
                            <Star className="h-4 w-4 mr-1" />
                            Admin Fee: {formatCurrency(payment.adminFee)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      payment.type === 'admin_fee' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {formatCurrency(payment.amount)}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No payments found</h3>
              <p className="text-sm">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Payment records will appear here when jobs are completed'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
