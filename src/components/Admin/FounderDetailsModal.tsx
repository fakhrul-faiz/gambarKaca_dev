import React from 'react';
import { X, Building, Mail, Phone, MapPin, Wallet, Calendar, Megaphone, DollarSign, CheckCircle, Ban, Star } from 'lucide-react';
import { Founder } from '../../types'; // Use central type
import { useApp } from '../../context/AppContext';

interface FounderDetailsModalProps {
  founder: Founder;
  onClose: () => void;
  onStatusChange: (founderId: string, newStatus: 'active' | 'suspended') => void;
}

const FounderDetailsModal: React.FC<FounderDetailsModalProps> = ({ 
  founder, 
  onClose, 
  onStatusChange 
}) => {
  const { campaigns, orders, transactions, talents } = useApp();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const handleStatusChangeClick = (newStatus: 'active' | 'suspended') => {
    onStatusChange(founder.id, newStatus);
    onClose();
  };

  // --- Recent Activity Logic ---
  // 1. Get this founder's campaigns, orders, transactions.
  const founderCampaigns = campaigns.filter(c => c.founderId === founder.id);
  const founderOrders = orders.filter(o => o.founderId === founder.id);
  const founderTransactions = transactions.filter(t => t.userId === founder.id);
  const totalSpent = founderTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalCampaigns = campaigns.filter(c => c.founderId === founder.id).length;

  // 2. Compose activity items
  const recentActivity: {
    message: string;
    timestamp: Date;
  }[] = [];

  // Campaign creation events
  founderCampaigns.forEach(c => {
    recentActivity.push({
      message: `Created campaign "${c.title}"`,
      timestamp: c.createdAt ? new Date(c.createdAt) : new Date(),
    });
  });

  // Order status updates (e.g. completed, delivered, etc)
  founderOrders.forEach(order => {
    if (order.status === 'completed') {
      recentActivity.push({
        message: `Completed order for "${order.campaignTitle}" (${order.productName})`,
        timestamp: order.updatedAt || order.createdAt || new Date(),
      });
    } else if (order.status === 'delivered') {
      recentActivity.push({
        message: `Delivered product for "${order.campaignTitle}"`,
        timestamp: order.updatedAt || order.createdAt || new Date(),
      });
    }
    // Add more order status checks as needed
  });

  // Transaction events
  founderTransactions.forEach(t => {
    if (t.type === 'debit') {
      recentActivity.push({
        message: `Spent ${formatCurrency(Number(t.amount))} for "${t.description}"`,
        timestamp: t.createdAt ? new Date(t.createdAt) : new Date(),
      });
    } else if (t.type === 'credit') {
      recentActivity.push({
        message: `Received ${formatCurrency(Number(t.amount))} - "${t.description}"`,
        timestamp: t.createdAt ? new Date(t.createdAt) : new Date(),
      });
    }
  });

  // Optionally: show talents approved (if you want)
  founderOrders.forEach(order => {
    if (order.status === 'pending_shipment') {
      const talent = talents.find(t => t.id === order.talentId);
      recentActivity.push({
        message: `Approved talent ${talent?.name || '—'} for "${order.campaignTitle}"`,
        timestamp: order.createdAt || new Date(),
      });
    }
  });

  // 3. Sort by timestamp desc, limit 5
  const sortedActivity = recentActivity
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);

  // --- End activity logic ---

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Founder Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header Section */}
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md object-cover">
              {founder.avatar ? (
                <img
                  src={founder.avatar}
                  alt={founder.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                founder.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{founder.name}</h3>
              <p className="text-gray-600">{founder.email}</p>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(founder.status)}`}>
                  {founder.status.charAt(0).toUpperCase() + founder.status.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ID: {founder.id}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{founder.email}</p>
                </div>
              </div>
              {founder.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{founder.phone}</p>
                  </div>
                </div>
              )}
              {founder.company && (
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="font-medium text-gray-900">{founder.company}</p>
                  </div>
                </div>
              )}
              {founder.address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium text-gray-900">{founder.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Statistics */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Account Statistics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Wallet className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Wallet Balance</p>
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(founder.walletBalance)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Spent</p>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalSpent)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Megaphone className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Total Campaigns</p>
                      <p className="text-2xl font-bold text-purple-900">{totalCampaigns}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Star className="h-8 w-8 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Average Rating</p>
                    <p className="text-2xl font-bold text-gray-900">4.8</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Timeline */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Account Timeline</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Account Created</p>
                  <p className="font-medium text-gray-900">{founder.createdAt.toLocaleDateString()}</p>
                </div>
              </div>
              {founder.lastLogin && (
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Last Login</p>
                    <p className="font-medium text-gray-900">{founder.lastLogin.toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2 text-sm text-gray-600">
                {sortedActivity.length > 0 ? (
                  sortedActivity.map((act, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <span>•</span>
                      <span>{act.message}</span>
                      <span className="text-xs text-gray-400 ml-2">
                        {act.timestamp.toLocaleDateString()} {act.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <p>No recent activity found.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
          
          {founder.status === 'pending' && (
            <button
              onClick={() => handleStatusChangeClick('active')}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Approve Account</span>
            </button>
          )}
          
          {founder.status === 'active' && (
            <button
              onClick={() => handleStatusChangeClick('suspended')}
              className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Ban className="h-4 w-4" />
              <span>Suspend Account</span>
            </button>
          )}
          
          {founder.status === 'suspended' && (
            <button
              onClick={() => handleStatusChangeClick('active')}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Reactivate Account</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FounderDetailsModal;
