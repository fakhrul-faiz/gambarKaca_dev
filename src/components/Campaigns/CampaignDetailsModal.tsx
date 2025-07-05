import React, { useState } from 'react';
import { X, Package, Calendar, DollarSign, Users, Star, Camera, Video, Clock, Tag, Ban, CheckCircle, Edit, Trash2, Play, Pause } from 'lucide-react';
import { Campaign, Talent } from '../../types';
import { useApp } from '../../context/AppContext';
import CampaignApplicantsModal from './CampaignApplicantsModal';

interface CampaignDetailsModalProps {
  campaign: Campaign;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: 'active' | 'paused') => void;
  isTalentView?: boolean;
}

const CampaignDetailsModal: React.FC<CampaignDetailsModalProps> = ({ 
  campaign, 
  onClose, 
  onEdit,
  onDelete,
  onStatusChange,
  isTalentView = false
}) => {
  const { talents } = useApp();
  const [showApplicants, setShowApplicants] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
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

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'image':
        return <Camera className="h-4 w-4" />;
      default:
        return (
          <div className="flex space-x-1">
            <Camera className="h-4 w-4" />
            <Video className="h-4 w-4" />
          </div>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case '30sec':
        return '30 Seconds';
      case '1min':
        return '1 Minute';
      case '3min':
        return '3 Minutes';
      default:
        return duration;
    }
  };

  const getApprovedTalents = (): Talent[] => {
    return talents.filter(talent => campaign.approvedTalents.includes(talent.id));
  };

  const getApplicantTalents = (): Talent[] => {
    return talents.filter(talent => campaign.applicants.includes(talent.id));
  };

  const handleStatusToggle = () => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    onStatusChange?.(newStatus);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      onDelete?.();
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Campaign Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{campaign.title}</h3>
                <p className="text-gray-600 mt-1">{campaign.description}</p>
                <div className="flex items-center space-x-3 mt-3">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRateLevelColor(campaign.rateLevel)}`}>
                    {campaign.rateLevel} Star Level
                  </span>
                </div>
              </div>
              
              {/* Action Buttons - Only show for founder view */}
              {!isTalentView && (
                <div className="flex items-center space-x-2">
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Campaign"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  
                  {onStatusChange && (
                    <button
                      onClick={handleStatusToggle}
                      className={`p-2 rounded-lg transition-colors ${
                        campaign.status === 'active' 
                          ? 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50' 
                          : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                      }`}
                      title={campaign.status === 'active' ? 'Pause Campaign' : 'Activate Campaign'}
                    >
                      {campaign.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                  )}
                  
                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Campaign"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Campaign Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Product</p>
                    <p className="font-medium text-gray-900">{campaign.productName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-medium text-gray-900">{campaign.category}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium text-gray-900">{getDurationLabel(campaign.duration)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-medium text-green-600">{formatCurrency(campaign.price)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {getMediaTypeIcon(campaign.mediaType)}
                  <div>
                    <p className="text-sm text-gray-600">Media Type</p>
                    <p className="font-medium text-gray-900 capitalize">{campaign.mediaType}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium text-gray-900">{campaign.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Images */}
            {campaign.productImages && campaign.productImages.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Product Images</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {campaign.productImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${campaign.productName} ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Approved Talents - Only show for founder view */}
            {!isTalentView && getApprovedTalents().length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Approved Talents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getApprovedTalents().map((talent) => (
                    <div key={talent.id} className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {talent.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-green-900">{talent.name}</h5>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRateLevelColor(talent.rateLevel)}`}>
                              {talent.rateLevel} Star
                            </span>
                            <span className="text-xs text-green-600">Approved</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Application Statistics - Only show for founder view */}
            {!isTalentView && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Application Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Total Applicants</p>
                        <p className="text-2xl font-bold text-blue-900">{campaign.applicants.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-sm text-green-600 font-medium">Approved Talents</p>
                        <p className="text-2xl font-bold text-green-900">{campaign.approvedTalents.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Star className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Success Rate</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {campaign.applicants.length > 0 
                            ? Math.round((campaign.approvedTalents.length / campaign.applicants.length) * 100)
                            : 0
                          }%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Applications - Only show for founder view */}
            {!isTalentView && campaign.applicants.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900">Pending Applications</h4>
                  <button
                    onClick={() => setShowApplicants(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Review Applications ({campaign.applicants.length})
                  </button>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <p className="text-yellow-800">
                    You have {campaign.applicants.length} pending application{campaign.applicants.length !== 1 ? 's' : ''} waiting for your review.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Applicants Modal */}
      {showApplicants && (
        <CampaignApplicantsModal
          campaignId={campaign.id}
          onClose={() => setShowApplicants(false)}
        />
      )}
    </>
  );
};

export default CampaignDetailsModal;