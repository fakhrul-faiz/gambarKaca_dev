import React, { useState, useEffect } from 'react';
import { Star, Search, Filter, Eye, Ban, CheckCircle, Mail, Calendar, DollarSign, MoreVertical, Award, Users, RefreshCw, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { updateUserStatus, updateProfile } from '../../lib/api';
import TalentDetailsModal from './TalentDetailsModal';
import TalentApprovalModal from './TalentApprovalModal';
import { Talent } from '../../types';

const TalentsPage: React.FC = () => {
  const { talents, setTalents, refreshData, loading } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rateLevelFilter, setRateLevelFilter] = useState<string>('all');
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [approvingTalent, setApprovingTalent] = useState<Talent | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Debug: Log talents data
  useEffect(() => {
    console.log('TalentsPage - talents data:', talents);
    console.log('TalentsPage - talents count:', talents.length);
  }, [talents]);

  // Apply search and filters
  const filteredTalents = talents.filter(talent => {
    const matchesSearch = talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         talent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         talent.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || talent.status === statusFilter;
    const matchesRateLevel = rateLevelFilter === 'all' || talent.rateLevel.toString() === rateLevelFilter;
    
    return matchesSearch && matchesStatus && matchesRateLevel;
  });

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

  const getRateLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-green-100 text-green-800';
      case 2:
        return 'bg-blue-100 text-blue-800';
      case 3:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Calendar className="h-4 w-4" />;
      case 'suspended':
        return <Ban className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const handleStatusChange = async (talentId: string, newStatus: 'active' | 'suspended') => {
    try {
      setActionLoading(true);
      console.log('Updating talent status:', talentId, 'to:', newStatus);
      
      await updateUserStatus(talentId, newStatus);
      
      // Update local state
      setTalents(talents.map(talent => 
        talent.id === talentId 
          ? { ...talent, status: newStatus }
          : talent
      ));
      
      // Refresh data to ensure consistency
      await refreshData();
      
      console.log('Talent status updated successfully');
    } catch (error) {
      console.error('Error updating talent status:', error);
      alert('Failed to update talent status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveTalent = (talent: Talent) => {
    setApprovingTalent(talent);
  };

  const handleApprovalSuccess = async (talentId: string, rateLevel: 1 | 2 | 3) => {
    try {
      setActionLoading(true);
      
      // Update talent status to active and set rate level
      await updateUserStatus(talentId, 'active');
      await updateProfile(talentId, { rate_level: rateLevel });
      
      // Update local state
      setTalents(talents.map(talent => 
        talent.id === talentId 
          ? { ...talent, status: 'active', rateLevel }
          : talent
      ));
      
      setApprovingTalent(null);
      await refreshData();
    } catch (error) {
      console.error('Error approving talent:', error);
      alert('Failed to approve talent. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefreshData = async () => {
    console.log('Manually refreshing talent data...');
    await refreshData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const getDaysAgo = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate average rating for talents
  const getAverageRating = () => {
    const activeTalents = talents.filter(t => t.status === 'active');
    if (activeTalents.length === 0) return 0;
    
    // Mock average rating calculation - in real app this would come from reviews
    return 4.7;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Talents Management</h1>
          <p className="text-gray-600">Manage talent accounts and monitor their performance</p>
        </div>
        <button
          onClick={handleRefreshData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Talents</p>
              <p className="text-2xl font-bold text-gray-900">
                {talents.filter(t => t.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-500">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">
                {talents.filter(t => t.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(talents.reduce((sum, t) => sum + t.totalEarnings, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {getAverageRating().toFixed(1)}
              </p>
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
            placeholder="Search talents by name, email, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          
          <select
            value={rateLevelFilter}
            onChange={(e) => setRateLevelFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="1">1 Star</option>
            <option value="2">2 Star</option>
            <option value="3">3 Star</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading talents...</p>
        </div>
      )}

      {/* Talents List */}
      {!loading && filteredTalents.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Talent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skills
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTalents.map((talent) => (
                  <tr key={talent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                          {talent.avatar ? (
                            <img
                              src={talent.avatar}
                              alt={talent.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            talent.name.charAt(0).toUpperCase()
                          )}
                        </div>

                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{talent.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {talent.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(talent.status)}`}>
                        {getStatusIcon(talent.status)}
                        <span className="ml-1 capitalize">{talent.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRateLevelColor(talent.rateLevel)}`}>
                        <Star className="h-3 w-3 mr-1" />
                        {talent.rateLevel} Star
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {talent.skills.slice(0, 2).join(', ')}
                        {talent.skills.length > 2 && ` +${talent.skills.length - 2}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {talent.skills.length} skill{talent.skills.length !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">{formatCurrency(talent.totalEarnings)}</div>
                      <div className="text-sm text-gray-500">
                        Total earned
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getDaysAgo(talent.createdAt)} days ago
                      </div>
                      <div className="text-sm text-gray-500">
                        {talent.createdAt.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedTalent(talent)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {talent.status === 'pending' ? (
                          <button
                            onClick={() => handleApproveTalent(talent)}
                            disabled={actionLoading}
                            className="px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-1"
                          >
                            <Settings className="h-3 w-3" />
                            <span>{actionLoading ? 'Processing...' : 'Approve'}</span>
                          </button>
                        ) : talent.status === 'active' ? (
                          <button
                            onClick={() => handleStatusChange(talent.id, 'suspended')}
                            disabled={actionLoading}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Suspend Account"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(talent.id, 'active')}
                            disabled={actionLoading}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Activate Account"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : !loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No talents found</h3>
            <p className="text-sm mb-4">
              {searchTerm || statusFilter !== 'all' || rateLevelFilter !== 'all'
                ? 'Try adjusting your search or filters' 
                : 'No talents have registered yet'
              }
            </p>
            <button
              onClick={handleRefreshData}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Talent Details Modal */}
      {selectedTalent && (
        <TalentDetailsModal
          talent={selectedTalent}
          onClose={() => setSelectedTalent(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Talent Approval Modal */}
      {approvingTalent && (
        <TalentApprovalModal
          talent={approvingTalent}
          onClose={() => setApprovingTalent(null)}
          onApprove={handleApprovalSuccess}
        />
      )}
    </div>
  );
};

export default TalentsPage;